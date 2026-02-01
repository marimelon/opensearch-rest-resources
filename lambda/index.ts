import { GetSecretValueCommand, SecretsManager } from '@aws-sdk/client-secrets-manager';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { HttpRequest } from '@smithy/protocol-http';
import { SignatureV4 } from '@smithy/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import type { CloudFormationCustomResourceEvent, CloudFormationCustomResourceHandler, Context } from 'aws-lambda';
import type { ResourceProperties } from '../src/types';
import { setTimeout } from 'timers/promises';

const sm = new SecretsManager({});

interface FetchOptions {
  url: string;
  method: string;
  headers: Headers;
  body: string | undefined;
  successStatus: string[];
}

const fetchWithRetry = async (
  options: FetchOptions,
  count = 0
): Promise<void> => {
  const { url, method, headers, body, successStatus } = options;
  const res = await fetch(url, {
    method,
    headers,
    body,
  });
  let json: { status: string; message: string } | undefined;
  try {
    const text = await res.text();
    console.log(`${res.status} ${text}`);
    json = JSON.parse(text);
  } catch (e) {
    console.log(e);
    // Do not throw here. We should handle certain exceptions with retry.
  }

  if (res.status == 403 || res.status == 401 || json?.status === 'CONFLICT') {
    // There is sometimes some delay before domain access policy takes effect,
    // especially when we call API right after a domain is provisioned.
    // It seems it usually takes about 15 seconds, so we will retry a few times.

    // There is sometimes a version conflict error when multiple updates are issued in short time.
    // It should also be recovered with retry.
    if (count > 10) {
      throw new Error(`Request failed after ${count} retries.`);
    }
    console.log(`Retrying #${count}... `);
    const base = count ** 2 * 500;
    const jitter = Math.floor(Math.random() * base);
    await setTimeout(Math.min(base + jitter, 10000));
    return await fetchWithRetry(options, count + 1);
  }

  if (json === undefined) {
    throw new Error(`Response body is not a valid json.`);
  }
  if (!successStatus.includes(json.status)) {
    throw new Error(`Request has an invalid status. Valid statuses: ${successStatus.join(',')}`);
  }
};

const createBasicAuthHeaders = (username: string, password: string): Headers => {
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + Buffer.from(username + ':' + password).toString('base64'));
  headers.append('Content-type', 'application/json');
  return headers;
};

const createSigV4SignedHeaders = async (
  method: string,
  url: string,
  body: string | undefined,
  region: string
): Promise<Headers> => {
  const parsedUrl = new URL(url);

  const request = new HttpRequest({
    method,
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port ? parseInt(parsedUrl.port) : undefined,
    path: parsedUrl.pathname,
    query: Object.fromEntries(parsedUrl.searchParams),
    headers: {
      host: parsedUrl.hostname,
      'Content-Type': 'application/json',
    },
    body: body,
  });

  const signer = new SignatureV4({
    service: 'es', // OpenSearch Service uses 'es' as the service name
    region,
    credentials: defaultProvider(),
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);

  const headers = new Headers();
  for (const [key, value] of Object.entries(signedRequest.headers)) {
    if (value !== undefined) {
      headers.append(key, value as string);
    }
  }

  return headers;
};

export const handler: CloudFormationCustomResourceHandler = async (event, context) => {
  console.log(JSON.stringify(event));

  const { ServiceToken, ...other } = event.ResourceProperties;
  const props = other as ResourceProperties;

  try {
    const baseUrl = `https://${props.opensearchHost}`;

    const makeRequest = async (method: string, endpoint: string, body: string | undefined, successStatus: string[]) => {
      const url = `${baseUrl}/${endpoint}`;
      let headers: Headers;

      if (props.useSigV4Auth) {
        // SigV4 authentication (IAM)
        if (!props.region) {
          throw new Error('region is required when useSigV4Auth is enabled');
        }
        headers = await createSigV4SignedHeaders(method, url, body, props.region);
      } else {
        // Basic Auth (master user)
        if (!props.masterUserSecretArn) {
          throw new Error('masterUserSecretArn is required when useSigV4Auth is not enabled');
        }
        const secretValue = await sm.send(new GetSecretValueCommand({ SecretId: props.masterUserSecretArn }));
        const { username, password } = JSON.parse(secretValue.SecretString!);
        headers = createBasicAuthHeaders(username, password);
      }

      await fetchWithRetry({ url, method, headers, body, successStatus });
    };

    switch (event.RequestType) {
      case 'Create':
      case 'Update': {
        console.log(props.payloadJson);
        await makeRequest('PUT', props.restEndpoint, props.payloadJson, ['OK', 'CREATED']);
        break;
      }
      case 'Delete': {
        await makeRequest('DELETE', props.restEndpoint, undefined, ['OK', 'NOT_FOUND']);
        break;
      }
    }
    await sendStatus('SUCCESS', event, context, props);
  } catch (e) {
    console.log(e);
    const err = e as Error;
    await sendStatus('FAILED', event, context, props, err.message);
  }
};

const sendStatus = async (
  status: 'SUCCESS' | 'FAILED',
  event: CloudFormationCustomResourceEvent,
  context: Context,
  props: ResourceProperties,
  reason?: string
) => {
  const responseBody = JSON.stringify({
    Status: status,
    Reason: (reason ?? '') + ' See the details in CloudWatch Log Stream: ' + context.logStreamName,
    PhysicalResourceId: props.restEndpoint,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    NoEcho: false,
    Data: { Empty: '' }, // To allow users to create an implicit dependency, it returns an empty string.
  });

  const res = await fetch(event.ResponseURL, {
    method: 'PUT',
    body: responseBody,
    headers: {
      'Content-Type': '',
      'Content-Length': responseBody.length.toString(),
    },
  });
  await res.text();
};
