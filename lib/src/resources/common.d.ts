import { RemovalPolicy } from 'aws-cdk-lib';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Domain } from 'aws-cdk-lib/aws-opensearchservice';
export interface ResourcePropsBase {
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
