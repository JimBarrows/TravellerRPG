import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';
import { Construct } from 'constructs';

export interface ComputeStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
  vpc: ec2.IVpc;
  databaseSecret: secretsmanager.Secret;
  databaseSecurityGroup: ec2.SecurityGroup;
  // Bucket references removed to avoid circular dependency
  // assetsBucket: s3.Bucket;
  // userUploadsBucket: s3.Bucket;
  // backupBucket: s3.Bucket;
}

export class ComputeStack extends cdk.Stack {
  public readonly gameEngineFunction: lambda.Function;
  public readonly authTriggersFunction: lambda.Function;
  public readonly backupFunction: lambda.Function;
  public readonly imageProcessingFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const { 
      appName, 
      environment, 
      vpc, 
      databaseSecret, 
      databaseSecurityGroup,
    } = props;

    // Common Lambda layer for shared dependencies
    const commonLayer = new lambda.LayerVersion(this, 'CommonLayer', {
      layerVersionName: `${appName}-${environment}-common`,
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'layers', 'common')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Common dependencies and utilities',
    });

    // Game engine Lambda function for complex game mechanics
    this.gameEngineFunction = new lambda.Function(this, 'GameEngineFunction', {
      functionName: `${appName}-${environment}-game-engine`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'game-engine')),
      layers: [commonLayer],
      environment: {
        NODE_ENV: environment,
        DATABASE_SECRET_ARN: databaseSecret.secretArn,
        DATABASE_NAME: 'travellerrpg',
        // ASSETS_BUCKET: assetsBucket.bucketName, // Removed to avoid circular dependency
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [databaseSecurityGroup],
      timeout: cdk.Duration.minutes(5),
      memorySize: environment === 'prod' ? 2048 : 1024,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: environment === 'prod'
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK,
      reservedConcurrentExecutions: environment === 'prod' ? 100 : 10,
    });

    // Grant necessary permissions
    databaseSecret.grantRead(this.gameEngineFunction);
    // assetsBucket.grantRead(this.gameEngineFunction); // Removed to avoid circular dependency

    // Auth triggers Lambda function for Cognito pre/post authentication
    this.authTriggersFunction = new lambda.Function(this, 'AuthTriggersFunction', {
      functionName: `${appName}-${environment}-auth-triggers`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'auth-triggers')),
      layers: [commonLayer],
      environment: {
        NODE_ENV: environment,
        DATABASE_SECRET_ARN: databaseSecret.secretArn,
        DATABASE_NAME: 'travellerrpg',
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [databaseSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: environment === 'prod'
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK,
    });

    // Grant auth triggers access to database
    databaseSecret.grantRead(this.authTriggersFunction);

    // Image processing Lambda function
    this.imageProcessingFunction = new lambda.Function(this, 'ImageProcessingFunction', {
      functionName: `${appName}-${environment}-image-processing`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'image-processing')),
      layers: [commonLayer],
      environment: {
        NODE_ENV: environment,
        // UPLOADS_BUCKET: userUploadsBucket.bucketName, // Removed to avoid circular dependency
        // ASSETS_BUCKET: assetsBucket.bucketName, // Removed to avoid circular dependency
      },
      timeout: cdk.Duration.minutes(2),
      memorySize: environment === 'prod' ? 3008 : 1024,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: environment === 'prod'
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK,
    });

    // Grant image processing function access to buckets (TODO: Add after deployment)
    // userUploadsBucket.grantReadWrite(this.imageProcessingFunction); // Removed to avoid circular dependency
    // assetsBucket.grantWrite(this.imageProcessingFunction); // Removed to avoid circular dependency

    // Grant image processing function permission to be invoked by S3 (TODO: Add after deployment)
    // this.imageProcessingFunction.addPermission('S3InvokePermission', {
    //   principal: new iam.ServicePrincipal('s3.amazonaws.com'),
    //   sourceArn: userUploadsBucket.bucketArn,
    // });

    // Backup Lambda function
    this.backupFunction = new lambda.Function(this, 'BackupFunction', {
      functionName: `${appName}-${environment}-backup`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'backup')),
      layers: [commonLayer],
      environment: {
        NODE_ENV: environment,
        DATABASE_SECRET_ARN: databaseSecret.secretArn,
        DATABASE_NAME: 'travellerrpg',
        // BACKUP_BUCKET: backupBucket.bucketName, // Removed to avoid circular dependency
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [databaseSecurityGroup],
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: environment === 'prod'
        ? logs.RetentionDays.THREE_MONTHS
        : logs.RetentionDays.ONE_WEEK,
    });

    // Grant backup function access to resources
    databaseSecret.grantRead(this.backupFunction);
    // backupBucket.grantWrite(this.backupFunction); // Removed to avoid circular dependency

    // Schedule daily backups for production
    if (environment === 'prod') {
      new events.Rule(this, 'DailyBackupRule', {
        ruleName: `${appName}-${environment}-daily-backup`,
        description: 'Trigger daily database backup',
        schedule: events.Schedule.cron({
          minute: '0',
          hour: '2', // 2 AM UTC
          day: '*',
          month: '*',
          year: '*',
        }),
        targets: [new targets.LambdaFunction(this.backupFunction)],
      });
    }

    // Create dead letter queue Lambda function
    const dlqFunction = new lambda.Function(this, 'DLQFunction', {
      functionName: `${appName}-${environment}-dlq-processor`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'dlq-processor')),
      layers: [commonLayer],
      environment: {
        NODE_ENV: environment,
      },
      timeout: cdk.Duration.minutes(1),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Create maintenance Lambda function
    const maintenanceFunction = new lambda.Function(this, 'MaintenanceFunction', {
      functionName: `${appName}-${environment}-maintenance`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'maintenance')),
      layers: [commonLayer],
      environment: {
        NODE_ENV: environment,
        DATABASE_SECRET_ARN: databaseSecret.secretArn,
        DATABASE_NAME: 'travellerrpg',
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [databaseSecurityGroup],
      timeout: cdk.Duration.minutes(15),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Grant maintenance function database access
    databaseSecret.grantRead(maintenanceFunction);

    // Schedule weekly maintenance for production
    if (environment === 'prod') {
      new events.Rule(this, 'WeeklyMaintenanceRule', {
        ruleName: `${appName}-${environment}-weekly-maintenance`,
        description: 'Trigger weekly maintenance tasks',
        schedule: events.Schedule.cron({
          minute: '0',
          hour: '3', // 3 AM UTC on Sundays
          weekDay: 'SUN',
        }),
        targets: [new targets.LambdaFunction(maintenanceFunction)],
      });
    }

    // Output Lambda function information
    new cdk.CfnOutput(this, 'GameEngineFunctionArn', {
      value: this.gameEngineFunction.functionArn,
      description: 'Game Engine Lambda Function ARN',
      exportName: `${appName}-${environment}-game-engine-arn`,
    });

    new cdk.CfnOutput(this, 'AuthTriggersFunctionArn', {
      value: this.authTriggersFunction.functionArn,
      description: 'Auth Triggers Lambda Function ARN',
      exportName: `${appName}-${environment}-auth-triggers-arn`,
    });

    new cdk.CfnOutput(this, 'ImageProcessingFunctionArn', {
      value: this.imageProcessingFunction.functionArn,
      description: 'Image Processing Lambda Function ARN',
      exportName: `${appName}-${environment}-image-processing-arn`,
    });

    new cdk.CfnOutput(this, 'BackupFunctionArn', {
      value: this.backupFunction.functionArn,
      description: 'Backup Lambda Function ARN',
      exportName: `${appName}-${environment}-backup-arn`,
    });
  }
}