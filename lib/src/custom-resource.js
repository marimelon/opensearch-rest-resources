"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchCustomResource = void 0;
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
        var _a, _b, _c;
        super(scope, id);
        const { vpc, domain, useSigV4Auth } = props;
        const handler = new aws_lambda_1.SingletonFunction(this, 'CustomResourceHandler', {
            runtime: new aws_lambda_1.Runtime('nodejs22.x', aws_lambda_1.RuntimeFamily.NODEJS, { supportsInlineCode: true }),
            code: aws_lambda_1.Code.fromInline((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../', 'lambda', 'dist', 'index.js')).toString()),
            handler: 'index.handler',
            // We need to create a singleton function per VPC and auth type
            uuid: `d4706ae7-e0a2-4092-a205-7e2d4fb887d4-${(_a = vpc === null || vpc === void 0 ? void 0 : vpc.node.addr) !== null && _a !== void 0 ? _a : 'no-vpc'}-${useSigV4Auth ? 'sigv4' : 'basic'}`,
            lambdaPurpose: 'OpenSearchRestCustomResourceHandler',
            timeout: aws_cdk_lib_1.Duration.minutes(3),
            vpc,
        });
        const properties = {
            opensearchHost: domain.domainEndpoint,
            restEndpoint: props.restEndpoint,
            payloadJson: props.payloadJson,
            schemaVersion: 'v2',
        };
        if (useSigV4Auth) {
            // Grant IAM permissions for OpenSearch API access
            handler.addToRolePolicy(new aws_iam_1.PolicyStatement({
                actions: ['es:ESHttpPut', 'es:ESHttpDelete', 'es:ESHttpGet', 'es:ESHttpPost'],
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
            removalPolicy: (_b = props.removalPolicy) !== null && _b !== void 0 ? _b : aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        this.resource = resource;
        // Access policy is required for master user to call OpenSearch APIs.
        const domainAccessPolicy = (_c = domain.node.tryFindChild('AccessPolicy')) === null || _c === void 0 ? void 0 : _c.node.defaultChild;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXJlc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1c3RvbS1yZXNvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBa0M7QUFDbEMsK0JBQTRCO0FBQzVCLDZDQUE2RTtBQUM3RSxpREFBb0U7QUFDcEUsaURBQXNEO0FBQ3RELHVEQUF5RjtBQUV6Rix1RUFBd0Q7QUFDeEQsMkNBQXVDO0FBOEN2QyxNQUFhLHdCQUF5QixTQUFRLHNCQUFTO0lBR3JELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBb0M7O1FBQzVFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRTVDLE1BQU0sT0FBTyxHQUFHLElBQUksOEJBQWlCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ25FLE9BQU8sRUFBRSxJQUFJLG9CQUFPLENBQUMsWUFBWSxFQUFFLDBCQUFhLENBQUMsTUFBTSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDdEYsSUFBSSxFQUFFLGlCQUFJLENBQUMsVUFBVSxDQUFDLElBQUEsaUJBQVksRUFBQyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwRyxPQUFPLEVBQUUsZUFBZTtZQUN4QiwrREFBK0Q7WUFDL0QsSUFBSSxFQUFFLHdDQUF3QyxNQUFBLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxRQUFRLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUM5RyxhQUFhLEVBQUUscUNBQXFDO1lBQ3BE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QUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsTUFBTSxNQUFNLEdBQUcscUNBQXFDLENBQUM7WUFDckQsSUFBSSxJQUFJLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RCxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDdkIsb0VBQW9FO2dCQUNwRSwwRUFBMEU7Z0JBQzFFLElBQUksR0FBRyxJQUFJLGlDQUF1QixDQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRTtvQkFDOUQsUUFBUSxFQUFFLEdBQUc7b0JBQ2IsTUFBTSxFQUFFLEdBQUc7b0JBQ1gsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxlQUFlO29CQUM1QyxxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQyxlQUFlO29CQUMzRCxXQUFXLEVBQUUsc0RBQXNEO2lCQUNwRSxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLDhCQUE4QixDQUFDLEdBQVc7UUFDL0MsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ3hELENBQUM7Q0FDRjtBQXBHRCw0REFvR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgQ3VzdG9tUmVzb3VyY2UsIFJlbW92YWxQb2xpY3ksIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ2ZuU2VjdXJpdHlHcm91cEluZ3Jlc3MsIElWcGMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IFBvbGljeVN0YXRlbWVudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgU2luZ2xldG9uRnVuY3Rpb24sIFJ1bnRpbWUsIFJ1bnRpbWVGYW1pbHksIENvZGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IERvbWFpbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1vcGVuc2VhcmNoc2VydmljZSc7XG5pbXBvcnQgeyBTZWNyZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VjcmV0c21hbmFnZXInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBSZXNvdXJjZVByb3BlcnRpZXMgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBPcGVuU2VhcmNoQ3VzdG9tUmVzb3VyY2VQcm9wcyB7XG4gIC8qKlxuICAgKiBUaGUgVlBDIHlvdXIgT3BlblNlYXJjaCBkb21haW4gaXMgaW4uXG4gICAqXG4gICAqIEBkZWZhdWx0IEFzc3VtZXMgeW91ciBEb21haW4gaXMgbm90IGRlcGxveWVkIHdpdGhpbiBhIFZQQ1xuICAgKi9cbiAgcmVhZG9ubHkgdnBjPzogSVZwYztcblxuICAvKipcbiAgICogVGhlIE9wZW5TZWFyY2ggZG9tYWluIHlvdSB3YW50IHRvIGNyZWF0ZSBhIHJlc291cmNlIGluLlxuICAgKi9cbiAgcmVhZG9ubHkgZG9tYWluOiBEb21haW47XG5cbiAgLyoqXG4gICAqIEEgUkVTVCBlbmRwb2ludCB0byBjYWxsIGZyb20gdGhlIGN1c3RvbSByZXNvdXJjZSBoYW5kbGVyLlxuICAgKiBJdCBzZW5kcyBQVVQgcmVxdWVzdCBvbiBhIGNyZWF0ZS91cGRhdGUgZXZlbnQgYW5kIERFTEVURSByZXF1ZXN0IG9uIGEgZGVsZXRlIGV2ZW50LlxuICAgKlxuICAgKiBAZXhhbXBsZSBfcGx1Z2lucy9fc2VjdXJpdHkvYXBpL3JvbGVzL3JvbGVOYW1lXG4gICAqL1xuICByZWFkb25seSByZXN0RW5kcG9pbnQ6IHN0cmluZztcblxuICAvKipcbiAgICogQSBwYXlsb2FkIGluIEpTT04gc3RyaW5nIHRvIHNlbmQgd2l0aCBhIHJlcXVlc3Qgb24gY3JlYXRlL3VwZGF0ZSBldmVudC5cbiAgICovXG4gIHJlYWRvbmx5IHBheWxvYWRKc29uOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFBvbGljeSB0byBhcHBseSB3aGVuIHRoZSByZXNvdXJjZSBpcyByZW1vdmVkIGZyb20gdGhlIHN0YWNrXG4gICAqXG4gICAqIEBkZWZhdWx0IFJlbW92YWxQb2xpY3kuREVTVFJPWVxuICAgKi9cbiAgcmVhZG9ubHkgcmVtb3ZhbFBvbGljeT86IFJlbW92YWxQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gdXNlIEFXUyBTaWdWNCBhdXRoZW50aWNhdGlvbiBpbnN0ZWFkIG9mIEhUVFAgQmFzaWMgQXV0aC5cbiAgICogV2hlbiBlbmFibGVkLCB0aGUgTGFtYmRhIGZ1bmN0aW9uJ3MgSUFNIHJvbGUgaXMgdXNlZCBmb3IgYXV0aGVudGljYXRpb24sXG4gICAqIGFuZCBtYXN0ZXIgdXNlciBzZWNyZXQgaXMgbm90IHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgcmVhZG9ubHkgdXNlU2lnVjRBdXRoPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIE9wZW5TZWFyY2hDdXN0b21SZXNvdXJjZSBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzb3VyY2U6IEN1c3RvbVJlc291cmNlO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBPcGVuU2VhcmNoQ3VzdG9tUmVzb3VyY2VQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCB7IHZwYywgZG9tYWluLCB1c2VTaWdWNEF1dGggfSA9IHByb3BzO1xuXG4gICAgY29uc3QgaGFuZGxlciA9IG5ldyBTaW5nbGV0b25GdW5jdGlvbih0aGlzLCAnQ3VzdG9tUmVzb3VyY2VIYW5kbGVyJywge1xuICAgICAgcnVudGltZTogbmV3IFJ1bnRpbWUoJ25vZGVqczIyLngnLCBSdW50aW1lRmFtaWx5Lk5PREVKUywgeyBzdXBwb3J0c0lubGluZUNvZGU6IHRydWUgfSksXG4gICAgICBjb2RlOiBDb2RlLmZyb21JbmxpbmUocmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vJywgJ2xhbWJkYScsICdkaXN0JywgJ2luZGV4LmpzJykpLnRvU3RyaW5nKCkpLFxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgLy8gV2UgbmVlZCB0byBjcmVhdGUgYSBzaW5nbGV0b24gZnVuY3Rpb24gcGVyIFZQQyBhbmQgYXV0aCB0eXBlXG4gICAgICB1dWlkOiBgZDQ3MDZhZTctZTBhMi00MDkyLWEyMDUtN2UyZDRmYjg4N2Q0LSR7dnBjPy5ub2RlLmFkZHIgPz8gJ25vLXZwYyd9LSR7dXNlU2lnVjRBdXRoID8gJ3NpZ3Y0JyA6ICdiYXNpYyd9YCxcbiAgICAgIGxhbWJkYVB1cnBvc2U6ICdPcGVuU2VhcmNoUmVzdEN1c3RvbVJlc291cmNlSGFuZGxlcicsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDMpLFxuICAgICAgdnBjLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcHJvcGVydGllczogUmVzb3VyY2VQcm9wZXJ0aWVzID0ge1xuICAgICAgb3BlbnNlYXJjaEhvc3Q6IGRvbWFpbi5kb21haW5FbmRwb2ludCxcbiAgICAgIHJlc3RFbmRwb2ludDogcHJvcHMucmVzdEVuZHBvaW50LFxuICAgICAgcGF5bG9hZEpzb246IHByb3BzLnBheWxvYWRKc29uLFxuICAgICAgc2NoZW1hVmVyc2lvbjogJ3YyJyxcbiAgICB9O1xuXG4gICAgaWYgKHVzZVNpZ1Y0QXV0aCkge1xuICAgICAgLy8gR3JhbnQgSUFNIHBlcm1pc3Npb25zIGZvciBPcGVuU2VhcmNoIEFQSSBhY2Nlc3NcbiAgICAgIGhhbmRsZXIuYWRkVG9Sb2xlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBhY3Rpb25zOiBbJ2VzOkVTSHR0cFB1dCcsICdlczpFU0h0dHBEZWxldGUnLCAnZXM6RVNIdHRwR2V0JywgJ2VzOkVTSHR0cFBvc3QnXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbYCR7ZG9tYWluLmRvbWFpbkFybn0vKmBdLFxuICAgICAgfSkpO1xuICAgICAgcHJvcGVydGllcy51c2VTaWdWNEF1dGggPSB0cnVlO1xuICAgICAgcHJvcGVydGllcy5yZWdpb24gPSBTdGFjay5vZih0aGlzKS5yZWdpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVzZSBIVFRQIEJhc2ljIEF1dGggd2l0aCBtYXN0ZXIgdXNlciBzZWNyZXRcbiAgICAgIGNvbnN0IG1hc3RlclVzZXJTZWNyZXQgPSBkb21haW4ubm9kZS50cnlGaW5kQ2hpbGQoJ01hc3RlclVzZXInKTtcbiAgICAgIGlmICghKG1hc3RlclVzZXJTZWNyZXQgaW5zdGFuY2VvZiBTZWNyZXQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYSBtYXN0ZXIgdXNlciBzZWNyZXQgZm9yIGRvbWFpbiAke2RvbWFpbi5ub2RlLnBhdGh9YCk7XG4gICAgICB9XG4gICAgICBtYXN0ZXJVc2VyU2VjcmV0LmdyYW50UmVhZChoYW5kbGVyKTtcbiAgICAgIHByb3BlcnRpZXMubWFzdGVyVXNlclNlY3JldEFybiA9IG1hc3RlclVzZXJTZWNyZXQuc2VjcmV0QXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc291cmNlID0gbmV3IEN1c3RvbVJlc291cmNlKHRoaXMsICdSZXNvdXJjZScsIHtcbiAgICAgIHNlcnZpY2VUb2tlbjogaGFuZGxlci5mdW5jdGlvbkFybixcbiAgICAgIHJlc291cmNlVHlwZTogJ0N1c3RvbTo6T3BlblNlYXJjaEN1c3RvbVJlc291cmNlJyxcbiAgICAgIHByb3BlcnRpZXMsXG4gICAgICByZW1vdmFsUG9saWN5OiBwcm9wcy5yZW1vdmFsUG9saWN5ID8/IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcbiAgICB0aGlzLnJlc291cmNlID0gcmVzb3VyY2U7XG5cbiAgICAvLyBBY2Nlc3MgcG9saWN5IGlzIHJlcXVpcmVkIGZvciBtYXN0ZXIgdXNlciB0byBjYWxsIE9wZW5TZWFyY2ggQVBJcy5cbiAgICBjb25zdCBkb21haW5BY2Nlc3NQb2xpY3kgPSBkb21haW4ubm9kZS50cnlGaW5kQ2hpbGQoJ0FjY2Vzc1BvbGljeScpPy5ub2RlLmRlZmF1bHRDaGlsZDtcbiAgICBpZiAoZG9tYWluQWNjZXNzUG9saWN5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYW4gYWNjZXNzIHBvbGljeSBmb3IgZG9tYWluICR7ZG9tYWluLm5vZGUucGF0aH1gKTtcbiAgICB9XG4gICAgaWYgKFN0YWNrLm9mKGRvbWFpbkFjY2Vzc1BvbGljeSkgPT0gU3RhY2sub2YocmVzb3VyY2UpKSB7XG4gICAgICByZXNvdXJjZS5ub2RlLmFkZERlcGVuZGVuY3koZG9tYWluQWNjZXNzUG9saWN5KTtcbiAgICB9XG5cbiAgICBsZXQgaXNJblZwYyA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBkb21haW4uY29ubmVjdGlvbnM7XG4gICAgICBpc0luVnBjID0gdHJ1ZTsgLy8gaWYgZG9tYWluLmNvbm5lY3Rpb25zIGRvZXMgbm90IHRocm93cywgaXQgbWVhbnMgdGhlIGRvbWFpbiBpcyBpbiBhIFZQQy5cbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIGlmIChpc0luVnBjICYmIHZwYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyB0aHJvdyBuZXcgRXJyb3IoYEl0IHNlZW1zIHlvdXIgT3BlblNlYXJjaCBkb21haW4gaXMgZGVwbG95ZWQgaW4gYSBWUEMuIFBsZWFzZSBzZXQgdGhlIHZwYyBwcm9wZXJ0eSBmb3IgT3BlblNlYXJjaCBjdXN0b20gcmVzb3VyY2VzIGZvciBkb21haW4gJHtkb21haW4ubm9kZS5wYXRofWApO1xuICAgIH1cblxuICAgIGlmICh2cGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgZG9tYWluU2VjdXJpdHlHcm91cCA9IGRvbWFpbi5jb25uZWN0aW9ucy5zZWN1cml0eUdyb3Vwc1swXTtcbiAgICAgIGNvbnN0IGhhbmRsZXJTZWN1cml0eUdyb3VwID0gaGFuZGxlci5jb25uZWN0aW9ucy5zZWN1cml0eUdyb3Vwc1swXTtcbiAgICAgIGNvbnN0IHJ1bGVJZCA9ICdJbmdyZXNzRnJvbU9wZW5TZWFyY2hDdXN0b21SZXNvdXJjZSc7XG4gICAgICBsZXQgcnVsZSA9IGRvbWFpblNlY3VyaXR5R3JvdXAubm9kZS50cnlGaW5kQ2hpbGQocnVsZUlkKTtcbiAgICAgIGlmIChydWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gV2UgY3JlYXRlIGFuIEwxIHJlc291cmNlIGRpcmVjdGx5IGhlcmUgYmVjYXVzZSBpdCBpcyBkaWZmaWN1bHQgdG9cbiAgICAgICAgLy8gcmV0cmlldmUgYmFja2luZyBpbmdyZXNzIHJ1bGUgcmVzb3VyY2UgZnJvbSBMMiBzZWN1cml0eSBncm91cCBjb25zdHJ1Y3RcbiAgICAgICAgcnVsZSA9IG5ldyBDZm5TZWN1cml0eUdyb3VwSW5ncmVzcyhkb21haW5TZWN1cml0eUdyb3VwLCBydWxlSWQsIHtcbiAgICAgICAgICBmcm9tUG9ydDogNDQzLFxuICAgICAgICAgIHRvUG9ydDogNDQzLFxuICAgICAgICAgIGlwUHJvdG9jb2w6ICd0Y3AnLFxuICAgICAgICAgIGdyb3VwSWQ6IGRvbWFpblNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgICAgIHNvdXJjZVNlY3VyaXR5R3JvdXBJZDogaGFuZGxlclNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5ncmVzcyBmcm9tIE9wZW5TZWFyY2ggUkVTVCBjdXN0b20gcmVzb3VyY2UgaGFuZGxlcicsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmVzb3VyY2Uubm9kZS5hZGREZXBlbmRlbmN5KHJ1bGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNvbnZlcnRzIGEgc3RyaW5nIHRvIGEgdG9rZW4gdGhhdCBoYXMgYW4gaW1wbGljaXQgZGVwZW5kZW5jeSBiZXR3ZWVuXG4gICAqIHRoaXMgcmVzb3VyY2UgYW5kIGEgY29uc3VtZXIgb2YgdGhlIHN0cmluZy5cbiAgICogQHBhcmFtIHN0ciBhbnkgc3RyaW5nXG4gICAqIEByZXR1cm5zIGBzdHJgIHdpdGggYW4gaW1wbGljaXQgZGVwZW5kZW5jeVxuICAgKi9cbiAgcHVibGljIGdldFN0cmluZ0FmdGVyUmVzb3VyY2VDcmVhdGlvbihzdHI6IHN0cmluZykge1xuICAgIHJldHVybiBgJHt0aGlzLnJlc291cmNlLmdldEF0dFN0cmluZygnRW1wdHknKX0ke3N0cn1gO1xuICB9XG59XG4iXX0=