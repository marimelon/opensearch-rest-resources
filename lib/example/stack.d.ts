import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
export declare class OpenSearchTestStack extends Stack {
    readonly testHandler: IFunction;
    constructor(scope: Construct, id: string, props?: StackProps);
}
