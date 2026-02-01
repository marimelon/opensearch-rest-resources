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
type Exclude = {
    [key: string]: Exclude | true;
};
/**
 * Context: jsii requires property keys of an object to be camel-cased,
 * while OpenSearch uses snake case for a REST API request payload.
 *
 * This is a utility function to convert an object with camel-cased keys to snake-cased.
 *
 * @internal
 *
 * @param item The object whose keys will be transformed.
 * @param exclude The keys that will not be transformed and copied to output directly
 */
export declare const recursiveFromCamelToSnake: (item: unknown, exclude?: Exclude) => unknown;
export {};
