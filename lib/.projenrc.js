"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projen_1 = require("projen");
const project = new projen_1.awscdk.AwsCdkConstructLibrary({
    author: 'tmokmss',
    authorAddress: 'tomookam@live.jp',
    cdkVersion: '2.1.0', // we don't guarantee it works in 2.1.0, but it should.
    defaultReleaseBranch: 'main',
    jsiiVersion: '~5.8.0',
    name: 'opensearch-rest-resources',
    projenrcTs: true,
    license: 'MIT',
    repositoryUrl: 'https://github.com/tmokmss/opensearch-rest-resources.git',
    description: 'Manage OpenSearch REST resources from AWS CDK.',
    keywords: ['aws', 'cdk', 'aws-cdk', 'opensearch'],
    eslintOptions: {
        dirs: ['src'],
        ignorePatterns: ['example/**/*', 'lambda/**/*', 'test/assets/**/*', 'test/*.snapshot/**/*', '*.d.ts'],
    },
    gitignore: ['*.js', '*.d.ts', '!testq/integ.*.snapshot/**/*', 'test/cdk.out'],
    devDeps: ['aws-cdk-lib', 'aws-cdk', 'constructs', '@aws-cdk/integ-runner@^2.186.2', '@aws-cdk/integ-tests-alpha@^2.189.1-alpha.0', 'esbuild'],
    peerDependencyOptions: {
        pinnedDevDependency: false,
    },
    publishToPypi: {
        distName: 'opensearch-rest-resources',
        module: 'opensearch_rest_resources',
    },
    npmProvenance: false,
});
// Bundle custom resource handler Lambda code
project.projectBuild.compileTask.prependExec('yarn install --frozen-lockfile && yarn build', {
    cwd: 'lambda',
});
// Run integ-test. This takes about 1 hour. Good luck.
project.projectBuild.testTask.exec('yarn integ-runner');
project.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLnByb2plbnJjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLnByb2plbnJjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQWdDO0FBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksZUFBTSxDQUFDLHNCQUFzQixDQUFDO0lBQ2hELE1BQU0sRUFBRSxTQUFTO0lBQ2pCLGFBQWEsRUFBRSxrQkFBa0I7SUFDakMsVUFBVSxFQUFFLE9BQU8sRUFBRSx1REFBdUQ7SUFDNUUsb0JBQW9CLEVBQUUsTUFBTTtJQUM1QixXQUFXLEVBQUUsUUFBUTtJQUNyQixJQUFJLEVBQUUsMkJBQTJCO0lBQ2pDLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLE9BQU8sRUFBRSxLQUFLO0lBQ2QsYUFBYSxFQUFFLDBEQUEwRDtJQUN6RSxXQUFXLEVBQUUsZ0RBQWdEO0lBQzdELFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQztJQUNqRCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDYixjQUFjLEVBQUUsQ0FBQyxjQUFjLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLFFBQVEsQ0FBQztLQUN0RztJQUNELFNBQVMsRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsOEJBQThCLEVBQUUsY0FBYyxDQUFDO0lBQzdFLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLGdDQUFnQyxFQUFFLDZDQUE2QyxFQUFFLFNBQVMsQ0FBQztJQUM3SSxxQkFBcUIsRUFBRTtRQUNyQixtQkFBbUIsRUFBRSxLQUFLO0tBQzNCO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsUUFBUSxFQUFFLDJCQUEyQjtRQUNyQyxNQUFNLEVBQUUsMkJBQTJCO0tBQ3BDO0lBQ0QsYUFBYSxFQUFFLEtBQUs7Q0FDckIsQ0FBQyxDQUFDO0FBRUgsNkNBQTZDO0FBQzdDLE9BQU8sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyw4Q0FBOEMsRUFBRTtJQUMzRixHQUFHLEVBQUUsUUFBUTtDQUNkLENBQUMsQ0FBQztBQUNILHNEQUFzRDtBQUN0RCxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN4RCxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhd3NjZGsgfSBmcm9tICdwcm9qZW4nO1xuY29uc3QgcHJvamVjdCA9IG5ldyBhd3NjZGsuQXdzQ2RrQ29uc3RydWN0TGlicmFyeSh7XG4gIGF1dGhvcjogJ3Rtb2ttc3MnLFxuICBhdXRob3JBZGRyZXNzOiAndG9tb29rYW1AbGl2ZS5qcCcsXG4gIGNka1ZlcnNpb246ICcyLjEuMCcsIC8vIHdlIGRvbid0IGd1YXJhbnRlZSBpdCB3b3JrcyBpbiAyLjEuMCwgYnV0IGl0IHNob3VsZC5cbiAgZGVmYXVsdFJlbGVhc2VCcmFuY2g6ICdtYWluJyxcbiAganNpaVZlcnNpb246ICd+NS44LjAnLFxuICBuYW1lOiAnb3BlbnNlYXJjaC1yZXN0LXJlc291cmNlcycsXG4gIHByb2plbnJjVHM6IHRydWUsXG4gIGxpY2Vuc2U6ICdNSVQnLFxuICByZXBvc2l0b3J5VXJsOiAnaHR0cHM6Ly9naXRodWIuY29tL3Rtb2ttc3Mvb3BlbnNlYXJjaC1yZXN0LXJlc291cmNlcy5naXQnLFxuICBkZXNjcmlwdGlvbjogJ01hbmFnZSBPcGVuU2VhcmNoIFJFU1QgcmVzb3VyY2VzIGZyb20gQVdTIENESy4nLFxuICBrZXl3b3JkczogWydhd3MnLCAnY2RrJywgJ2F3cy1jZGsnLCAnb3BlbnNlYXJjaCddLFxuICBlc2xpbnRPcHRpb25zOiB7XG4gICAgZGlyczogWydzcmMnXSxcbiAgICBpZ25vcmVQYXR0ZXJuczogWydleGFtcGxlLyoqLyonLCAnbGFtYmRhLyoqLyonLCAndGVzdC9hc3NldHMvKiovKicsICd0ZXN0Lyouc25hcHNob3QvKiovKicsICcqLmQudHMnXSxcbiAgfSxcbiAgZ2l0aWdub3JlOiBbJyouanMnLCAnKi5kLnRzJywgJyF0ZXN0cS9pbnRlZy4qLnNuYXBzaG90LyoqLyonLCAndGVzdC9jZGsub3V0J10sXG4gIGRldkRlcHM6IFsnYXdzLWNkay1saWInLCAnYXdzLWNkaycsICdjb25zdHJ1Y3RzJywgJ0Bhd3MtY2RrL2ludGVnLXJ1bm5lckBeMi4xODYuMicsICdAYXdzLWNkay9pbnRlZy10ZXN0cy1hbHBoYUBeMi4xODkuMS1hbHBoYS4wJywgJ2VzYnVpbGQnXSxcbiAgcGVlckRlcGVuZGVuY3lPcHRpb25zOiB7XG4gICAgcGlubmVkRGV2RGVwZW5kZW5jeTogZmFsc2UsXG4gIH0sXG4gIHB1Ymxpc2hUb1B5cGk6IHtcbiAgICBkaXN0TmFtZTogJ29wZW5zZWFyY2gtcmVzdC1yZXNvdXJjZXMnLFxuICAgIG1vZHVsZTogJ29wZW5zZWFyY2hfcmVzdF9yZXNvdXJjZXMnLFxuICB9LFxuICBucG1Qcm92ZW5hbmNlOiBmYWxzZSxcbn0pO1xuXG4vLyBCdW5kbGUgY3VzdG9tIHJlc291cmNlIGhhbmRsZXIgTGFtYmRhIGNvZGVcbnByb2plY3QucHJvamVjdEJ1aWxkLmNvbXBpbGVUYXNrLnByZXBlbmRFeGVjKCd5YXJuIGluc3RhbGwgLS1mcm96ZW4tbG9ja2ZpbGUgJiYgeWFybiBidWlsZCcsIHtcbiAgY3dkOiAnbGFtYmRhJyxcbn0pO1xuLy8gUnVuIGludGVnLXRlc3QuIFRoaXMgdGFrZXMgYWJvdXQgMSBob3VyLiBHb29kIGx1Y2suXG5wcm9qZWN0LnByb2plY3RCdWlsZC50ZXN0VGFzay5leGVjKCd5YXJuIGludGVnLXJ1bm5lcicpO1xucHJvamVjdC5zeW50aCgpO1xuIl19