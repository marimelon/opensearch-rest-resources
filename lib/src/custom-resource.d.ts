import { RemovalPolicy } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Domain } from 'aws-cdk-lib/aws-opensearchservice';
import { Construct } from 'constructs';
export interface OpenSearchCustomResourceProps {
    /**
     * The VPC your OpenSearch domain is in.
     *
     * @default Assumes your Domain is not deployed within a VPC
     */
    readonly vpc?: IVpc;
    /**
     * The OpenSearch domain you want to create a resource in.
     */
    readonly domain: Domain;
    /**
     * A REST endpoint to call from the custom resource handler.
     * It sends PUT request on a create/update event and DELETE request on a delete event.
     *
     * @example _plugins/_security/api/roles/roleName
     */
    readonly restEndpoint: string;
    /**
     * A payload in JSON string to send with a request on create/update event.
     */
    readonly payloadJson: string;
    /**
     * Policy to apply when the resource is removed from the stack
     *
     * @default RemovalPolicy.DESTROY
     */
    readonly removalPolicy?: RemovalPolicy;
    /**
     * Whether to use AWS SigV4 authentication instead of HTTP Basic Auth.
     * When enabled, the Lambda function's IAM role is used for authentication,
     * and master user secret is not required.
     *
     * @default false
     */
    readonly useSigV4Auth?: boolean;
}
export declare class OpenSearchCustomResource extends Construct {
    private readonly resource;
    constructor(scope: Construct, id: string, props: OpenSearchCustomResourceProps);
    /**
     * This function converts a string to a token that has an implicit dependency between
     * this resource and a consumer of the string.
     * @param str any string
     * @returns `str` with an implicit dependency
     */
    getStringAfterResourceCreation(str: string): string;
}
