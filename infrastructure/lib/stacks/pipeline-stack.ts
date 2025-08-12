import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { TravellerInfrastructureStack } from '../traveller-infrastructure-stack';

export interface PipelineStackProps extends cdk.StackProps {
  appName: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
}

/**
 * CDK Pipeline stack for automated deployments
 * This creates a self-mutating pipeline that deploys infrastructure changes
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const { appName, githubOwner, githubRepo, githubBranch } = props;

    // Create the CDK Pipeline
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: `${appName}-pipeline`,
      crossAccountKeys: true,
      dockerEnabledForSynth: true,
      
      // Source from GitHub
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub(
          `${githubOwner}/${githubRepo}`,
          githubBranch,
          {
            authentication: cdk.SecretValue.secretsManager('github-token'),
          }
        ),
        
        // Install dependencies and build
        commands: [
          'cd infrastructure',
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
        
        // Output directory
        primaryOutputDirectory: 'infrastructure/cdk.out',
        
        // Environment variables
        env: {
          NPM_CONFIG_UNSAFE_PERM: 'true',
        },
      }),
      
      // Build environment
      synthCodeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
          computeType: codebuild.ComputeType.MEDIUM,
          privileged: true,
        },
        
        // Additional permissions for the build role
        rolePolicy: [
          new iam.PolicyStatement({
            actions: ['sts:AssumeRole'],
            resources: ['*'],
            conditions: {
              StringEquals: {
                'iam:ResourceTag/aws-cdk:bootstrap-role': 'lookup',
              },
            },
          }),
        ],
      },
      
      // Configure self-mutation
      selfMutationCodeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        },
      },
    });

    // Add development stage
    pipeline.addStage(new ApplicationStage(this, 'Dev', {
      appName,
      environment: 'dev',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
      },
    }), {
      // Pre-deployment validations
      pre: [
        new pipelines.ShellStep('ValidateTemplates', {
          commands: [
            'cd infrastructure',
            'npm ci',
            'npm run cdk diff',
          ],
        }),
      ],
      
      // Post-deployment validations
      post: [
        new pipelines.ShellStep('IntegrationTests', {
          commands: [
            'echo "Running integration tests for dev environment"',
            'cd infrastructure',
            'npm test',
          ],
          envFromCfnOutputs: {
            // Map CloudFormation outputs to environment variables
            // API_URL: apiStack.apiUrl,
            // WEB_URL: webStack.webUrl,
          },
        }),
      ],
    });

    // Add staging stage with manual approval
    const stagingStage = pipeline.addStage(new ApplicationStage(this, 'Staging', {
      appName,
      environment: 'staging',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
      },
    }), {
      pre: [
        new pipelines.ManualApprovalStep('PromoteToStaging', {
          comment: 'Approve deployment to staging environment',
        }),
      ],
      
      post: [
        new pipelines.ShellStep('SmokeTests', {
          commands: [
            'echo "Running smoke tests for staging environment"',
            '# Add actual smoke test commands here',
          ],
        }),
        
        new pipelines.ShellStep('PerformanceTests', {
          commands: [
            'echo "Running performance tests for staging environment"',
            '# Add performance testing commands here',
          ],
        }),
      ],
    });

    // Add production stage with manual approval
    pipeline.addStage(new ApplicationStage(this, 'Prod', {
      appName,
      environment: 'prod',
      env: {
        account: process.env.CDK_PROD_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
      },
    }), {
      pre: [
        new pipelines.ManualApprovalStep('PromoteToProd', {
          comment: 'Approve deployment to production environment',
        }),
        
        new pipelines.ShellStep('ProductionReadinessCheck', {
          commands: [
            'echo "Performing production readiness checks"',
            '# Check database backups',
            '# Verify monitoring and alarms',
            '# Confirm rollback procedures',
          ],
        }),
      ],
      
      post: [
        new pipelines.ShellStep('ProductionValidation', {
          commands: [
            'echo "Validating production deployment"',
            '# Run health checks',
            '# Verify critical paths',
            '# Check monitoring dashboards',
          ],
        }),
      ],
    });

    // Add wave for parallel deployments (if needed for multiple regions)
    const wave = pipeline.addWave('MultiRegion', {
      pre: [
        new pipelines.ShellStep('PrepareMultiRegion', {
          commands: [
            'echo "Preparing for multi-region deployment"',
          ],
        }),
      ],
    });

    // Could add additional regional stages here
    // wave.addStage(new ApplicationStage(...));

    // Output pipeline information
    new cdk.CfnOutput(this, 'PipelineArn', {
      value: pipeline.pipeline.pipelineArn,
      description: 'ARN of the deployment pipeline',
      exportName: `${appName}-pipeline-arn`,
    });

    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipeline.pipelineName,
      description: 'Name of the deployment pipeline',
      exportName: `${appName}-pipeline-name`,
    });
  }
}

/**
 * Application stage containing all stacks for an environment
 */
class ApplicationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: {
    appName: string;
    environment: string;
  } & cdk.StageProps) {
    super(scope, id, props);

    // Deploy the main infrastructure stack
    new TravellerInfrastructureStack(this, 'TravellerRPGInfrastructure', {
      appName: props.appName,
      environment: props.environment,
      stackName: `${props.appName}-${props.environment}-infrastructure`,
      env: props.env,
    });

    // Could add additional stacks here for different components
    // new MonitoringStack(this, 'Monitoring', { ... });
    // new AnalyticsStack(this, 'Analytics', { ... });
  }
}