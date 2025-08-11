import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { AuthStack } from './stacks/auth-stack';
import { DatabaseStack } from './stacks/database-stack';
import { StorageStack } from './stacks/storage-stack';
import { ApiStack } from './stacks/api-stack';
import { ComputeStack } from './stacks/compute-stack';
import { ConfigStack } from './stacks/config-stack';

export interface TravellerInfrastructureStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
}

export class TravellerInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TravellerInfrastructureStackProps) {
    super(scope, id, props);

    const { appName, environment } = props;

    // Create VPC for the application
    const vpc = new ec2.Vpc(this, 'VPC', {
      vpcName: `${appName}-${environment}-vpc`,
      cidr: '10.0.0.0/16',
      maxAzs: environment === 'prod' ? 3 : 2,
      natGateways: environment === 'prod' ? 2 : 1,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'PrivateWithEgress',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'PrivateIsolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Create VPC endpoints for AWS services to reduce NAT Gateway costs
    new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
      vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      privateDnsEnabled: true,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    new ec2.GatewayVpcEndpoint(this, 'S3Endpoint', {
      vpc,
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [
        {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create Configuration Stack first (for parameters and secrets)
    const configStack = new ConfigStack(this, 'ConfigStack', {
      appName,
      environment,
      stackName: `${appName}-${environment}-config`,
      env: props.env,
    });

    // Create Authentication Stack
    const authStack = new AuthStack(this, 'AuthStack', {
      appName,
      environment,
      stackName: `${appName}-${environment}-auth`,
      env: props.env,
    });

    // Create Storage Stack
    const storageStack = new StorageStack(this, 'StorageStack', {
      appName,
      environment,
      stackName: `${appName}-${environment}-storage`,
      env: props.env,
    });

    // Create Database Stack
    const databaseStack = new DatabaseStack(this, 'DatabaseStack', {
      appName,
      environment,
      vpc,
      stackName: `${appName}-${environment}-database`,
      env: props.env,
    });

    // Create Compute Stack
    const computeStack = new ComputeStack(this, 'ComputeStack', {
      appName,
      environment,
      vpc,
      databaseSecret: databaseStack.databaseSecret,
      databaseSecurityGroup: databaseStack.securityGroup,
      // Bucket references removed to avoid circular dependency
      // assetsBucket: storageStack.assetsBucket,
      // userUploadsBucket: storageStack.userUploadsBucket,
      // backupBucket: storageStack.backupBucket,
      stackName: `${appName}-${environment}-compute`,
      env: props.env,
    });

    // Create API Stack
    const apiStack = new ApiStack(this, 'ApiStack', {
      appName,
      environment,
      userPool: authStack.userPool,
      database: databaseStack.database,
      databaseSecret: databaseStack.databaseSecret,
      databaseSecurityGroup: databaseStack.securityGroup,
      stackName: `${appName}-${environment}-api`,
      env: props.env,
    });

    // Add dependencies
    databaseStack.addDependency(authStack);
    computeStack.addDependency(databaseStack);
    // computeStack.addDependency(storageStack); // Removed to avoid circular dependency
    apiStack.addDependency(authStack);
    apiStack.addDependency(databaseStack);

    // TODO: Add S3 event notification in a separate stack or post-deployment
    // storageStack.userUploadsBucket.addEventNotification(...)

    // Output VPC information
    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID',
      exportName: `${appName}-${environment}-vpc-id`,
    });

    new cdk.CfnOutput(this, 'VpcCidr', {
      value: vpc.vpcCidrBlock,
      description: 'VPC CIDR Block',
      exportName: `${appName}-${environment}-vpc-cidr`,
    });
  }
}