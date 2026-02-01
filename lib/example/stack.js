"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchTestStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_opensearchservice_1 = require("aws-cdk-lib/aws-opensearchservice");
const role_1 = require("../src/resources/role");
const role_mapping_1 = require("../src/resources/role-mapping");
const user_1 = require("../src/resources/user");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path_1 = require("path");
class OpenSearchTestStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props = {}) {
        super(scope, id, props);
        const vpc = new aws_ec2_1.Vpc(this, 'Vpc', { maxAzs: 2, natGateways: 1 });
        const targetSubnets = [vpc.privateSubnets[0]];
        // Following the best practices:
        // https://docs.aws.amazon.com/opensearch-service/latest/developerguide/bp.html
        const domain = new aws_opensearchservice_1.Domain(this, 'Domain', {
            version: aws_opensearchservice_1.EngineVersion.OPENSEARCH_2_11,
            capacity: {
                // https://docs.aws.amazon.com/opensearch-service/latest/developerguide/supported-instance-types.html
                dataNodeInstanceType: 't3.small.search',
                dataNodes: targetSubnets.length,
                // masterNodeInstanceType: 't3.small.search',
                // masterNodes: 1,
                multiAzWithStandbyEnabled: false,
            },
            // zoneAwareness: {
            //   enabled: true,
            //   availabilityZoneCount: targetSubnets.length,
            // },
            ebs: {
                volumeSize: 30,
                volumeType: aws_ec2_1.EbsDeviceVolumeType.GP3,
                throughput: 125,
                iops: 3000,
            },
            enforceHttps: true,
            fineGrainedAccessControl: {
                masterUserName: 'admin',
            },
            nodeToNodeEncryption: true,
            encryptionAtRest: {
                enabled: true,
            },
            vpc,
            vpcSubnets: [{ subnets: targetSubnets }],
            logging: {
                auditLogEnabled: true,
                slowSearchLogEnabled: true,
                appLogEnabled: true,
                slowIndexLogEnabled: true,
            },
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        // Recommended policy when using fine-grained access control
        // https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-recommendations
        domain.addAccessPolicies(new aws_iam_1.PolicyStatement({
            principals: [new aws_iam_1.AnyPrincipal()],
            actions: ['es:ESHttp*'],
            resources: [domain.domainArn + '/*'],
        }));
        const testHandler = new aws_lambda_nodejs_1.NodejsFunction(this, 'TestHandler', {
            entry: (0, path_1.join)(__dirname, 'lambda', 'index.ts'),
            depsLockFilePath: (0, path_1.join)(__dirname, 'lambda', 'package-lock.json'),
            bundling: {
                commandHooks: {
                    beforeBundling: (i, _o) => [`cd ${i} && npm install`],
                    afterBundling: (_i, _o) => [],
                    beforeInstall: (_i, _o) => [],
                },
            },
            vpc,
            environment: {
                OPENSEARCH_HOST: domain.domainEndpoint,
            },
            timeout: aws_cdk_lib_1.Duration.seconds(10),
        });
        domain.connections.allowDefaultPortFrom(testHandler);
        this.testHandler = testHandler;
        // Never remove all of them when testing! VPC Lambda requires 20 minutes to delete itself.
        const role = new role_1.OpenSearchRole(this, 'Role1', {
            vpc,
            domain,
            roleName: 'Role1',
            payload: {
                clusterPermissions: ['indices:data/write/bulk'],
                indexPermissions: [
                    {
                        indexPatterns: ['*'],
                        allowedActions: ['read', 'write', 'index', 'create_index'],
                    },
                ],
            },
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
        });
        new role_mapping_1.OpenSearchRoleMapping(this, 'RoleMapping1', {
            vpc,
            domain,
            roleName: role.roleName,
            payload: {
                backendRoles: [testHandler.role.roleArn],
            },
        });
        new user_1.OpenSearchUser(this, 'User1', {
            vpc,
            domain,
            userName: 'User1',
            payload: {
                password: '64loxy5K;5jr',
                attributes: {
                    foo: 'bar',
                },
            },
        });
    }
}
exports.OpenSearchTestStack = OpenSearchTestStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9leGFtcGxlL3N0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUF5RTtBQUN6RSxpREFBK0Q7QUFDL0QsaURBQW9FO0FBQ3BFLDZFQUEwRTtBQUUxRSxnREFBdUQ7QUFDdkQsZ0VBQXNFO0FBQ3RFLGdEQUF1RDtBQUN2RCxxRUFBK0Q7QUFDL0QsK0JBQTRCO0FBRzVCLE1BQWEsbUJBQW9CLFNBQVEsbUJBQUs7SUFHNUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxRQUFvQixFQUFFO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhFLE1BQU0sYUFBYSxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTlDLGdDQUFnQztRQUNoQywrRUFBK0U7UUFDL0UsTUFBTSxNQUFNLEdBQUcsSUFBSSw4QkFBTSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDeEMsT0FBTyxFQUFFLHFDQUFhLENBQUMsZUFBZTtZQUN0QyxRQUFRLEVBQUU7Z0JBQ1IscUdBQXFHO2dCQUNyRyxvQkFBb0IsRUFBRSxpQkFBaUI7Z0JBQ3ZDLFNBQVMsRUFBRSxhQUFhLENBQUMsTUFBTTtnQkFDL0IsNkNBQTZDO2dCQUM3QyxrQkFBa0I7Z0JBQ2xCLHlCQUF5QixFQUFFLEtBQUs7YUFDakM7WUFDRCxtQkFBbUI7WUFDbkIsbUJBQW1CO1lBQ25CLGlEQUFpRDtZQUNqRCxLQUFLO1lBQ0wsR0FBRyxFQUFFO2dCQUNILFVBQVUsRUFBRSxFQUFFO2dCQUNkLFVBQVUsRUFBRSw2QkFBbUIsQ0FBQyxH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SUFBSSxFQUFFLE9BQU8sRUFBRTtZQUNoQyxHQUFHO1lBQ0gsTUFBTTtZQUNOLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLE9BQU8sRUFBRTtnQkFDUCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsVUFBVSxFQUFFO29CQUNWLEdBQUcsRUFBRSxLQUFLO2lCQUNYO2FBQ0Y7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF0SEQsa0RBc0hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RhY2ssIFN0YWNrUHJvcHMsIFJlbW92YWxQb2xpY3ksIER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgRWJzRGV2aWNlVm9sdW1lVHlwZSwgVnBjIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgeyBQb2xpY3lTdGF0ZW1lbnQsIEFueVByaW5jaXBhbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgRG9tYWluLCBFbmdpbmVWZXJzaW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLW9wZW5zZWFyY2hzZXJ2aWNlJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgT3BlblNlYXJjaFJvbGUgfSBmcm9tICcuLi9zcmMvcmVzb3VyY2VzL3JvbGUnO1xuaW1wb3J0IHsgT3BlblNlYXJjaFJvbGVNYXBwaW5nIH0gZnJvbSAnLi4vc3JjL3Jlc291cmNlcy9yb2xlLW1hcHBpbmcnO1xuaW1wb3J0IHsgT3BlblNlYXJjaFVzZXIgfSBmcm9tICcuLi9zcmMvcmVzb3VyY2VzL3VzZXInO1xuaW1wb3J0IHsgTm9kZWpzRnVuY3Rpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBJRnVuY3Rpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcblxuZXhwb3J0IGNsYXNzIE9wZW5TZWFyY2hUZXN0U3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSB0ZXN0SGFuZGxlcjogSUZ1bmN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBTdGFja1Byb3BzID0ge30pIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHZwYyA9IG5ldyBWcGModGhpcywgJ1ZwYycsIHsgbWF4QXpzOiAyLCBuYXRHYXRld2F5czogMSB9KTtcblxuICAgIGNvbnN0IHRhcmdldFN1Ym5ldHMgPSBbdnBjLnByaXZhdGVTdWJuZXRzWzBdXTtcblxuICAgIC8vIEZvbGxvd2luZyB0aGUgYmVzdCBwcmFjdGljZXM6XG4gICAgLy8gaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL29wZW5zZWFyY2gtc2VydmljZS9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvYnAuaHRtbFxuICAgIGNvbnN0IGRvbWFpbiA9IG5ldyBEb21haW4odGhpcywgJ0RvbWFpbicsIHtcbiAgICAgIHZlcnNpb246IEVuZ2luZVZlcnNpb24uT1BFTlNFQVJDSF8yXzExLFxuICAgICAgY2FwYWNpdHk6IHtcbiAgICAgICAgLy8gaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL29wZW5zZWFyY2gtc2VydmljZS9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvc3VwcG9ydGVkLWluc3RhbmNlLXR5cGVzLmh0bWxcbiAgICAgICAgZGF0YU5vZGVJbnN0YW5jZVR5cGU6ICd0My5zbWFsbC5zZWFyY2gnLFxuICAgICAgICBkYXRhTm9kZXM6IHRhcmdldFN1Ym5ldHMubGVuZ3RoLFxuICAgICAgICAvLyBtYXN0ZXJOb2RlSW5zdGFuY2VUeXBlOiAndDMuc21hbGwuc2VhcmNoJyxcbiAgICAgICAgLy8gbWFzdGVyTm9kZXM6IDEsXG4gICAgICAgIG11bHRpQXpXaXRoU3RhbmRieUVuYWJsZWQ6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIC8vIHpvbmVBd2FyZW5lc3M6IHtcbiAgICAgIC8vICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIC8vICAgYXZhaWxhYmlsaXR5Wm9uZUNvdW50OiB0YXJnZXRTdWJuZXRzLmxlbmd0aCxcbiAgICAgIC8vIH0sXG4gICAgICBlYnM6IHtcbiAgICAgICAgdm9sdW1lU2l6ZTogMzAsXG4gICAgICAgIHZvbHVtZVR5cGU6IEVic0RldmljZVZvbHVtZVR5cGUuR1AzLFxuICAgICAgICB0aHJvdWdocHV0OiAxMjUsXG4gICAgICAgIGlvcHM6IDMwMDAsXG4gICAgICB9LFxuICAgICAgZW5mb3JjZUh0dHBzOiB0cnVlLFxuICAgICAgZmluZUdyYWluZWRBY2Nlc3NDb250cm9sOiB7XG4gICAgICAgIG1hc3RlclVzZXJOYW1lOiAnYWRtaW4nLFxuICAgICAgfSxcbiAgICAgIG5vZGVUb05vZGVFbmNyeXB0aW9uOiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbkF0UmVzdDoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHZwYyxcbiAgICAgIHZwY1N1Ym5ldHM6IFt7IHN1Ym5ldHM6IHRhcmdldFN1Ym5ldHMgfV0sXG4gICAgICBsb2dnaW5nOiB7XG4gICAgICAgIGF1ZGl0TG9nRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgc2xvd1NlYXJjaExvZ0VuYWJsZWQ6IHRydWUsXG4gICAgICAgIGFwcExvZ0VuYWJsZWQ6IHRydWUsXG4gICAgICAgIHNsb3dJbmRleExvZ0VuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgLy8gUmVjb21tZW5kZWQgcG9saWN5IHdoZW4gdXNpbmcgZmluZS1ncmFpbmVkIGFjY2VzcyBjb250cm9sXG4gICAgLy8gaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL29wZW5zZWFyY2gtc2VydmljZS9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvZmdhYy5odG1sI2ZnYWMtcmVjb21tZW5kYXRpb25zXG4gICAgZG9tYWluLmFkZEFjY2Vzc1BvbGljaWVzKFxuICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIHByaW5jaXBhbHM6IFtuZXcgQW55UHJpbmNpcGFsKCldLFxuICAgICAgICBhY3Rpb25zOiBbJ2VzOkVTSHR0cConXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbZG9tYWluLmRvbWFpbkFybiArICcvKiddLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgY29uc3QgdGVzdEhhbmRsZXIgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ1Rlc3RIYW5kbGVyJywge1xuICAgICAgZW50cnk6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhJywgJ2luZGV4LnRzJyksXG4gICAgICBkZXBzTG9ja0ZpbGVQYXRoOiBqb2luKF9fZGlybmFtZSwgJ2xhbWJkYScsICdwYWNrYWdlLWxvY2suanNvbicpLFxuICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgY29tbWFuZEhvb2tzOiB7XG4gICAgICAgICAgYmVmb3JlQnVuZGxpbmc6IChpLCBfbykgPT4gW2BjZCAke2l9ICYmIG5wbSBpbnN0YWxsYF0sXG4gICAgICAgICAgYWZ0ZXJCdW5kbGluZzogKF9pLCBfbykgPT4gW10sXG4gICAgICAgICAgYmVmb3JlSW5zdGFsbDogKF9pLCBfbykgPT4gW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdnBjLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgT1BFTlNFQVJDSF9IT1NUOiBkb21haW4uZG9tYWluRW5kcG9pbnQsXG4gICAgICB9LFxuICAgICAgdGltZW91dDogRHVyYXRpb24uc2Vjb25kcygxMCksXG4gICAgfSk7XG4gICAgZG9tYWluLmNvbm5lY3Rpb25zLmFsbG93RGVmYXVsdFBvcnRGcm9tKHRlc3RIYW5kbGVyKTtcbiAgICB0aGlzLnRlc3RIYW5kbGVyID0gdGVzdEhhbmRsZXI7XG5cbiAgICAvLyBOZXZlciByZW1vdmUgYWxsIG9mIHRoZW0gd2hlbiB0ZXN0aW5nISBWUEMgTGFtYmRhIHJlcXVpcmVzIDIwIG1pbnV0ZXMgdG8gZGVsZXRlIGl0c2VsZi5cbiAgICBjb25zdCByb2xlID0gbmV3IE9wZW5TZWFyY2hSb2xlKHRoaXMsICdSb2xlMScsIHtcbiAgICAgIHZwYyxcbiAgICAgIGRvbWFpbixcbiAgICAgIHJvbGVOYW1lOiAnUm9sZTEnLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBjbHVzdGVyUGVybWlzc2lvbnM6IFsnaW5kaWNlczpkYXRhL3dyaXRlL2J1bGsnXSxcbiAgICAgICAgaW5kZXhQZXJtaXNzaW9uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGluZGV4UGF0dGVybnM6IFsnKiddLFxuICAgICAgICAgICAgYWxsb3dlZEFjdGlvbnM6IFsncmVhZCcsICd3cml0ZScsICdpbmRleCcsICdjcmVhdGVfaW5kZXgnXSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuUkVUQUlOX09OX1VQREFURV9PUl9ERUxFVEUsXG4gICAgfSk7XG5cbiAgICBuZXcgT3BlblNlYXJjaFJvbGVNYXBwaW5nKHRoaXMsICdSb2xlTWFwcGluZzEnLCB7XG4gICAgICB2cGMsXG4gICAgICBkb21haW4sXG4gICAgICByb2xlTmFtZTogcm9sZS5yb2xlTmFtZSxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgYmFja2VuZFJvbGVzOiBbdGVzdEhhbmRsZXIucm9sZSEucm9sZUFybl0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3IE9wZW5TZWFyY2hVc2VyKHRoaXMsICdVc2VyMScsIHtcbiAgICAgIHZwYyxcbiAgICAgIGRvbWFpbixcbiAgICAgIHVzZXJOYW1lOiAnVXNlcjEnLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBwYXNzd29yZDogJzY0bG94eTVLOzVqcicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBmb286ICdiYXInLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19