"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchCustomResource = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const fs_1 = require("fs");
const path_1 = require("path");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_secretsmanager_1 = require("aws-cdk-lib/aws-secretsmanager");
const constructs_1 = require("constructs");
class OpenSearchCustomResource extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { vpc, domain, useSigV4Auth } = props;
        const handler = new aws_lambda_1.SingletonFunction(this, 'CustomResourceHandler', {
            runtime: new aws_lambda_1.Runtime('nodejs22.x', aws_lambda_1.RuntimeFamily.NODEJS, { supportsInlineCode: true }),
            code: aws_lambda_1.Code.fromInline((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../', 'lambda', 'dist', 'index.js')).toString()),
            handler: 'index.handler',
            // We need to create a singleton function per VPC
            uuid: `d4706ae7-e0a2-4092-a205-7e2d4fb887d4-${vpc?.node.addr ?? 'no-vpc'}`,
            lambdaPurpose: 'OpenSearchRestCustomResourceHandler',
            timeout: aws_cdk_lib_1.Duration.minutes(3),
            vpc,
        });
        const properties = {
            opensearchHost: domain.domainEndpoint,
            restEndpoint: props.restEndpoint,
            payloadJson: props.payloadJson,
            schemaVersion: 'v1',
        };
        if (useSigV4Auth) {
            // Grant IAM permissions for OpenSearch API access
            handler.addToRolePolicy(new aws_iam_1.PolicyStatement({
                actions: ['es:ESHttpPut', 'es:ESHttpDelete'],
                resources: [`${domain.domainArn}/*`],
            }));
            properties.useSigV4Auth = true;
            properties.region = aws_cdk_lib_1.Stack.of(this).region;
        }
        else {
            // Use HTTP Basic Auth with master user secret
            const masterUserSecret = domain.node.tryFindChild('MasterUser');
            if (!(masterUserSecret instanceof aws_secretsmanager_1.Secret)) {
                throw new Error(`Cannot find a master user secret for domain ${domain.node.path}`);
            }
            masterUserSecret.grantRead(handler);
            properties.masterUserSecretArn = masterUserSecret.secretArn;
        }
        const resource = new aws_cdk_lib_1.CustomResource(this, 'Resource', {
            serviceToken: handler.functionArn,
            resourceType: 'Custom::OpenSearchCustomResource',
            properties,
            removalPolicy: props.removalPolicy ?? aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        this.resource = resource;
        // Access policy is required for master user to call OpenSearch APIs.
        const domainAccessPolicy = domain.node.tryFindChild('AccessPolicy')?.node.defaultChild;
        if (domainAccessPolicy === undefined) {
            throw new Error(`Cannot find an access policy for domain ${domain.node.path}`);
        }
        if (aws_cdk_lib_1.Stack.of(domainAccessPolicy) == aws_cdk_lib_1.Stack.of(resource)) {
            resource.node.addDependency(domainAccessPolicy);
        }
        let isInVpc = false;
        try {
            domain.connections;
            isInVpc = true; // if domain.connections does not throws, it means the domain is in a VPC.
        }
        catch (e) { }
        if (isInVpc && vpc === undefined) {
            // throw new Error(`It seems your OpenSearch domain is deployed in a VPC. Please set the vpc property for OpenSearch custom resources for domain ${domain.node.path}`);
        }
        if (vpc !== undefined) {
            const domainSecurityGroup = domain.connections.securityGroups[0];
            const handlerSecurityGroup = handler.connections.securityGroups[0];
            const ruleId = 'IngressFromOpenSearchCustomResource';
            let rule = domainSecurityGroup.node.tryFindChild(ruleId);
            if (rule === undefined) {
                // We create an L1 resource directly here because it is difficult to
                // retrieve backing ingress rule resource from L2 security group construct
                rule = new aws_ec2_1.CfnSecurityGroupIngress(domainSecurityGroup, ruleId, {
                    fromPort: 443,
                    toPort: 443,
                    ipProtocol: 'tcp',
                    groupId: domainSecurityGroup.securityGroupId,
                    sourceSecurityGroupId: handlerSecurityGroup.securityGroupId,
                    description: 'Ingress from OpenSearch REST custom resource handler',
                });
            }
            resource.node.addDependency(rule);
        }
    }
    /**
     * This function converts a string to a token that has an implicit dependency between
     * this resource and a consumer of the string.
     * @param str any string
     * @returns `str` with an implicit dependency
     */
    getStringAfterResourceCreation(str) {
        return `${this.resource.getAttString('Empty')}${str}`;
    }
}
exports.OpenSearchCustomResource = OpenSearchCustomResource;
_a = JSII_RTTI_SYMBOL_1;
OpenSearchCustomResource[_a] = { fqn: "opensearch-rest-resources.OpenSearchCustomResource", version: "0.0.0" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXJlc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2N1c3RvbS1yZXNvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUFrQztBQUNsQywrQkFBNEI7QUFDNUIsNkNBQTZFO0FBQzdFLGlEQUFvRTtBQUNwRSxpREFBc0Q7QUFDdEQsdURBQXlGO0FBRXpGLHVFQUF3RDtBQUN4RCwyQ0FBdUM7QUE4Q3ZDLE1BQWEsd0JBQXlCLFNBQVEsc0JBQVM7SUFHckQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvQztRQUM1RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLEtBQUssQ0FBQztRQUU1QyxNQUFNLE9BQU8sR0FBRyxJQUFJLDhCQUFpQixDQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRTtZQUNuRSxPQUFPLEVBQUUsSUFBSSxvQkFBTyxDQUFDLFlBQVksRUFBRSwwQkFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDO1lBQ3RGLElBQUksRUFBRSxpQkFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFBLGlCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEcsT0FBTyxFQUFFLGVBQWU7WUFDeEIsaURBQWlEO1lBQ2pELElBQUksRUFBRSx3Q0FBd0MsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksUUFBUSxFQUFFO1lBQzFFLGFBQWEsRUFBRSxxQ0FBcUM7WUFDcEQsT0FBTyxFQUFFLHNCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM1QixHQUFHO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxV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QXFDLENBQUM7WUFDckQsSUFBSSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RCxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDdkIsb0VBQW9FO2dCQUNwRSwwRUFBMEU7Z0JBQzFFLElBQUksR0FBRyxJQUFJLGlDQUF1QixDQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRTtvQkFDOUQsUUFBUSxFQUFFLEdBQUc7b0JBQ2IsTUFBTSxFQUFFLEdBQUc7b0JBQ1gsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxlQUFlO29CQUM1QyxxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQyxlQUFlO29CQUMzRCxXQUFXLEVBQUUsc0RBQXNEO2lCQUNwRSxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLDhCQUE4QixDQUFDLEdBQVc7UUFDL0MsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ3hELENBQUM7O0FBbkdILDREQW9HQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IER1cmF0aW9uLCBDdXN0b21SZXNvdXJjZSwgUmVtb3ZhbFBvbGljeSwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDZm5TZWN1cml0eUdyb3VwSW5ncmVzcywgSVZwYyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgUG9saWN5U3RhdGVtZW50IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBTaW5nbGV0b25GdW5jdGlvbiwgUnVudGltZSwgUnVudGltZUZhbWlseSwgQ29kZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgRG9tYWluIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLW9wZW5zZWFyY2hzZXJ2aWNlJztcbmltcG9ydCB7IFNlY3JldCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZWNyZXRzbWFuYWdlcic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IFJlc291cmNlUHJvcGVydGllcyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wZW5TZWFyY2hDdXN0b21SZXNvdXJjZVByb3BzIHtcbiAgLyoqXG4gICAqIFRoZSBWUEMgeW91ciBPcGVuU2VhcmNoIGRvbWFpbiBpcyBpbi5cbiAgICpcbiAgICogQGRlZmF1bHQgQXNzdW1lcyB5b3VyIERvbWFpbiBpcyBub3QgZGVwbG95ZWQgd2l0aGluIGEgVlBDXG4gICAqL1xuICByZWFkb25seSB2cGM/OiBJVnBjO1xuXG4gIC8qKlxuICAgKiBUaGUgT3BlblNlYXJjaCBkb21haW4geW91IHdhbnQgdG8gY3JlYXRlIGEgcmVzb3VyY2UgaW4uXG4gICAqL1xuICByZWFkb25seSBkb21haW46IERvbWFpbjtcblxuICAvKipcbiAgICogQSBSRVNUIGVuZHBvaW50IHRvIGNhbGwgZnJvbSB0aGUgY3VzdG9tIHJlc291cmNlIGhhbmRsZXIuXG4gICAqIEl0IHNlbmRzIFBVVCByZXF1ZXN0IG9uIGEgY3JlYXRlL3VwZGF0ZSBldmVudCBhbmQgREVMRVRFIHJlcXVlc3Qgb24gYSBkZWxldGUgZXZlbnQuXG4gICAqXG4gICAqIEBleGFtcGxlIF9wbHVnaW5zL19zZWN1cml0eS9hcGkvcm9sZXMvcm9sZU5hbWVcbiAgICovXG4gIHJlYWRvbmx5IHJlc3RFbmRwb2ludDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIHBheWxvYWQgaW4gSlNPTiBzdHJpbmcgdG8gc2VuZCB3aXRoIGEgcmVxdWVzdCBvbiBjcmVhdGUvdXBkYXRlIGV2ZW50LlxuICAgKi9cbiAgcmVhZG9ubHkgcGF5bG9hZEpzb246IHN0cmluZztcblxuICAvKipcbiAgICogUG9saWN5IHRvIGFwcGx5IHdoZW4gdGhlIHJlc291cmNlIGlzIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2tcbiAgICpcbiAgICogQGRlZmF1bHQgUmVtb3ZhbFBvbGljeS5ERVNUUk9ZXG4gICAqL1xuICByZWFkb25seSByZW1vdmFsUG9saWN5PzogUmVtb3ZhbFBvbGljeTtcblxuICAvKipcbiAgICogV2hldGhlciB0byB1c2UgQVdTIFNpZ1Y0IGF1dGhlbnRpY2F0aW9uIGluc3RlYWQgb2YgSFRUUCBCYXNpYyBBdXRoLlxuICAgKiBXaGVuIGVuYWJsZWQsIHRoZSBMYW1iZGEgZnVuY3Rpb24ncyBJQU0gcm9sZSBpcyB1c2VkIGZvciBhdXRoZW50aWNhdGlvbixcbiAgICogYW5kIG1hc3RlciB1c2VyIHNlY3JldCBpcyBub3QgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICByZWFkb25seSB1c2VTaWdWNEF1dGg/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgT3BlblNlYXJjaEN1c3RvbVJlc291cmNlIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHJpdmF0ZSByZWFkb25seSByZXNvdXJjZTogQ3VzdG9tUmVzb3VyY2U7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IE9wZW5TZWFyY2hDdXN0b21SZXNvdXJjZVByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHsgdnBjLCBkb21haW4sIHVzZVNpZ1Y0QXV0aCB9ID0gcHJvcHM7XG5cbiAgICBjb25zdCBoYW5kbGVyID0gbmV3IFNpbmdsZXRvbkZ1bmN0aW9uKHRoaXMsICdDdXN0b21SZXNvdXJjZUhhbmRsZXInLCB7XG4gICAgICBydW50aW1lOiBuZXcgUnVudGltZSgnbm9kZWpzMjIueCcsIFJ1bnRpbWVGYW1pbHkuTk9ERUpTLCB7IHN1cHBvcnRzSW5saW5lQ29kZTogdHJ1ZSB9KSxcbiAgICAgIGNvZGU6IENvZGUuZnJvbUlubGluZShyZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8nLCAnbGFtYmRhJywgJ2Rpc3QnLCAnaW5kZXguanMnKSkudG9TdHJpbmcoKSksXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAvLyBXZSBuZWVkIHRvIGNyZWF0ZSBhIHNpbmdsZXRvbiBmdW5jdGlvbiBwZXIgVlBDXG4gICAgICB1dWlkOiBgZDQ3MDZhZTctZTBhMi00MDkyLWEyMDUtN2UyZDRmYjg4N2Q0LSR7dnBjPy5ub2RlLmFkZHIgPz8gJ25vLXZwYyd9YCxcbiAgICAgIGxhbWJkYVB1cnBvc2U6ICdPcGVuU2VhcmNoUmVzdEN1c3RvbVJlc291cmNlSGFuZGxlcicsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDMpLFxuICAgICAgdnBjLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcHJvcGVydGllczogUmVzb3VyY2VQcm9wZXJ0aWVzID0ge1xuICAgICAgb3BlbnNlYXJjaEhvc3Q6IGRvbWFpbi5kb21haW5FbmRwb2ludCxcbiAgICAgIHJlc3RFbmRwb2ludDogcHJvcHMucmVzdEVuZHBvaW50LFxuICAgICAgcGF5bG9hZEpzb246IHByb3BzLnBheWxvYWRKc29uLFxuICAgICAgc2NoZW1hVmVyc2lvbjogJ3YxJyxcbiAgICB9O1xuXG4gICAgaWYgKHVzZVNpZ1Y0QXV0aCkge1xuICAgICAgLy8gR3JhbnQgSUFNIHBlcm1pc3Npb25zIGZvciBPcGVuU2VhcmNoIEFQSSBhY2Nlc3NcbiAgICAgIGhhbmRsZXIuYWRkVG9Sb2xlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBhY3Rpb25zOiBbJ2VzOkVTSHR0cFB1dCcsICdlczpFU0h0dHBEZWxldGUnXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbYCR7ZG9tYWluLmRvbWFpbkFybn0vKmBdLFxuICAgICAgfSkpO1xuICAgICAgcHJvcGVydGllcy51c2VTaWdWNEF1dGggPSB0cnVlO1xuICAgICAgcHJvcGVydGllcy5yZWdpb24gPSBTdGFjay5vZih0aGlzKS5yZWdpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVzZSBIVFRQIEJhc2ljIEF1dGggd2l0aCBtYXN0ZXIgdXNlciBzZWNyZXRcbiAgICAgIGNvbnN0IG1hc3RlclVzZXJTZWNyZXQgPSBkb21haW4ubm9kZS50cnlGaW5kQ2hpbGQoJ01hc3RlclVzZXInKTtcbiAgICAgIGlmICghKG1hc3RlclVzZXJTZWNyZXQgaW5zdGFuY2VvZiBTZWNyZXQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYSBtYXN0ZXIgdXNlciBzZWNyZXQgZm9yIGRvbWFpbiAke2RvbWFpbi5ub2RlLnBhdGh9YCk7XG4gICAgICB9XG4gICAgICBtYXN0ZXJVc2VyU2VjcmV0LmdyYW50UmVhZChoYW5kbGVyKTtcbiAgICAgIHByb3BlcnRpZXMubWFzdGVyVXNlclNlY3JldEFybiA9IG1hc3RlclVzZXJTZWNyZXQuc2VjcmV0QXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc291cmNlID0gbmV3IEN1c3RvbVJlc291cmNlKHRoaXMsICdSZXNvdXJjZScsIHtcbiAgICAgIHNlcnZpY2VUb2tlbjogaGFuZGxlci5mdW5jdGlvbkFybixcbiAgICAgIHJlc291cmNlVHlwZTogJ0N1c3RvbTo6T3BlblNlYXJjaEN1c3RvbVJlc291cmNlJyxcbiAgICAgIHByb3BlcnRpZXMsXG4gICAgICByZW1vdmFsUG9saWN5OiBwcm9wcy5yZW1vdmFsUG9saWN5ID8/IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcbiAgICB0aGlzLnJlc291cmNlID0gcmVzb3VyY2U7XG5cbiAgICAvLyBBY2Nlc3MgcG9saWN5IGlzIHJlcXVpcmVkIGZvciBtYXN0ZXIgdXNlciB0byBjYWxsIE9wZW5TZWFyY2ggQVBJcy5cbiAgICBjb25zdCBkb21haW5BY2Nlc3NQb2xpY3kgPSBkb21haW4ubm9kZS50cnlGaW5kQ2hpbGQoJ0FjY2Vzc1BvbGljeScpPy5ub2RlLmRlZmF1bHRDaGlsZDtcbiAgICBpZiAoZG9tYWluQWNjZXNzUG9saWN5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYW4gYWNjZXNzIHBvbGljeSBmb3IgZG9tYWluICR7ZG9tYWluLm5vZGUucGF0aH1gKTtcbiAgICB9XG4gICAgaWYgKFN0YWNrLm9mKGRvbWFpbkFjY2Vzc1BvbGljeSkgPT0gU3RhY2sub2YocmVzb3VyY2UpKSB7XG4gICAgICByZXNvdXJjZS5ub2RlLmFkZERlcGVuZGVuY3koZG9tYWluQWNjZXNzUG9saWN5KTtcbiAgICB9XG5cbiAgICBsZXQgaXNJblZwYyA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBkb21haW4uY29ubmVjdGlvbnM7XG4gICAgICBpc0luVnBjID0gdHJ1ZTsgLy8gaWYgZG9tYWluLmNvbm5lY3Rpb25zIGRvZXMgbm90IHRocm93cywgaXQgbWVhbnMgdGhlIGRvbWFpbiBpcyBpbiBhIFZQQy5cbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIGlmIChpc0luVnBjICYmIHZwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyB0aHJvdyBuZXcgRXJyb3IoYEl0IHNlZW1zIHlvdXIgT3BlblNlYXJjaCBkb21haW4gaXMgZGVwbG95ZWQgaW4gYSBWUEMuIFBsZWFzZSBzZXQgdGhlIHZwYyBwcm9wZXJ0eSBmb3IgT3BlblNlYXJjaCBjdXN0b20gcmVzb3VyY2VzIGZvciBkb21haW4gJHtkb21haW4ubm9kZS5wYXRofWApO1xuICAgIH1cblxuICAgIGlmICh2cGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgZG9tYWluU2VjdXJpdHlHcm91cCA9IGRvbWFpbi5jb25uZWN0aW9ucy5zZWN1cml0eUdyb3Vwc1swXTtcbiAgICAgIGNvbnN0IGhhbmRsZXJTZWN1cml0eUdyb3VwID0gaGFuZGxlci5jb25uZWN0aW9ucy5zZWN1cml0eUdyb3Vwc1swXTtcbiAgICAgIGNvbnN0IHJ1bGVJZCA9ICdJbmdyZXNzRnJvbU9wZW5TZWFyY2hDdXN0b21SZXNvdXJjZSc7XG4gICAgICBsZXQgcnVsZSA9IGRvbWFpblNlY3VyaXR5R3JvdXAubm9kZS50cnlGaW5kQ2hpbGQocnVsZUlkKTtcbiAgICAgIGlmIChydWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gV2UgY3JlYXRlIGFuIEwxIHJlc291cmNlIGRpcmVjdGx5IGhlcmUgYmVjYXVzZSBpdCBpcyBkaWZmaWN1bHQgdG9cbiAgICAgICAgLy8gcmV0cmlldmUgYmFja2luZyBpbmdyZXNzIHJ1bGUgcmVzb3VyY2UgZnJvbSBMMiBzZWN1cml0eSBncm91cCBjb25zdHJ1Y3RcbiAgICAgICAgcnVsZSA9IG5ldyBDZm5TZWN1cml0eUdyb3VwSW5ncmVzcyhkb21haW5TZWN1cml0eUdyb3VwLCBydWxlSWQsIHtcbiAgICAgICAgICBmcm9tUG9ydDogNDQzLFxuICAgICAgICAgIHRvUG9ydDogNDQzLFxuICAgICAgICAgIGlwUHJvdG9jb2w6ICd0Y3AnLFxuICAgICAgICAgIGdyb3VwSWQ6IGRvbWFpblNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgICAgIHNvdXJjZVNlY3VyaXR5R3JvdXBJZDogaGFuZGxlclNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5ncmVzcyBmcm9tIE9wZW5TZWFyY2ggUkVTVCBjdXN0b20gcmVzb3VyY2UgaGFuZGxlcicsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmVzb3VyY2Uubm9kZS5hZGREZXBlbmRlbmN5KHJ1bGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNvbnZlcnRzIGEgc3RyaW5nIHRvIGEgdG9rZW4gdGhhdCBoYXMgYW4gaW1wbGljaXQgZGVwZW5kZW5jeSBiZXR3ZWVuXG4gICAqIHRoaXMgcmVzb3VyY2UgYW5kIGEgY29uc3VtZXIgb2YgdGhlIHN0cmluZy5cbiAgICogQHBhcmFtIHN0ciBhbnkgc3RyaW5nXG4gICAqIEByZXR1cm5zIGBzdHJgIHdpdGggYW4gaW1wbGljaXQgZGVwZW5kZW5jeVxuICAgKi9cbiAgcHVibGljIGdldFN0cmluZ0FmdGVyUmVzb3VyY2VDcmVhdGlvbihzdHI6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLnJlc291cmNlLmdldEF0dFN0cmluZygnRW1wdHknKX0ke3N0cn1gO1xuICB9XG59XG4iXX0=