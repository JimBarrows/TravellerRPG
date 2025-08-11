import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
  vpc: ec2.IVpc;
}

export class DatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { appName, environment, vpc } = props;

    // Create security group for database
    this.securityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: `Security group for ${appName} ${environment} database`,
      allowAllOutbound: false,
    });

    // Create database subnet group
    const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      vpc,
      description: `Subnet group for ${appName} ${environment} database`,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    // Create secret for database credentials
    this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: `${appName}-${environment}-db-secret`,
      description: `Database credentials for ${appName} ${environment}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'dbadmin',
        }),
        generateStringKey: 'password',
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
        passwordLength: 32,
      },
    });

    // Create parameter group for PostgreSQL optimization
    const parameterGroup = new rds.ParameterGroup(this, 'ParameterGroup', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_9,
      }),
      description: `Parameter group for ${appName} ${environment}`,
      parameters: {
        'shared_preload_libraries': 'pg_stat_statements',
        'log_statement': 'all',
        'log_duration': 'on',
        'max_connections': '200',
        'shared_buffers': '256MB',
        'effective_cache_size': '1GB',
        'maintenance_work_mem': '128MB',
        'work_mem': '8MB',
        'random_page_cost': '1.1',
        'effective_io_concurrency': '200',
      },
    });

    // Determine instance class based on environment
    const instanceClass = environment === 'prod' 
      ? ec2.InstanceClass.T3 
      : ec2.InstanceClass.T3;
    const instanceSize = environment === 'prod'
      ? ec2.InstanceSize.LARGE
      : ec2.InstanceSize.SMALL;

    // Create RDS PostgreSQL instance
    this.database = new rds.DatabaseInstance(this, 'Database', {
      databaseName: 'travellerrpg',
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_9,
      }),
      instanceType: ec2.InstanceType.of(instanceClass, instanceSize),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [this.securityGroup],
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      allocatedStorage: environment === 'prod' ? 100 : 20,
      maxAllocatedStorage: environment === 'prod' ? 1000 : 100,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      parameterGroup,
      multiAz: environment === 'prod',
      deletionProtection: environment === 'prod',
      backupRetention: environment === 'prod' 
        ? cdk.Duration.days(30) 
        : cdk.Duration.days(7),
      preferredBackupWindow: '03:00-04:00',
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
      enablePerformanceInsights: environment === 'prod',
      performanceInsightRetention: environment === 'prod'
        ? rds.PerformanceInsightRetention.MONTHS_1
        : undefined,
      monitoringInterval: environment === 'prod'
        ? cdk.Duration.seconds(60)
        : undefined,
      cloudwatchLogsExports: ['postgresql'],
      autoMinorVersionUpgrade: true,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.SNAPSHOT
        : cdk.RemovalPolicy.DESTROY,
    });

    // Create CloudWatch alarms for production
    if (environment === 'prod') {
      new cloudwatch.Alarm(this, 'DatabaseCPUAlarm', {
        metric: this.database.metricCPUUtilization(),
        threshold: 80,
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        alarmDescription: 'Alert when database CPU exceeds 80%',
      });

      new cloudwatch.Alarm(this, 'DatabaseStorageAlarm', {
        metric: this.database.metricFreeStorageSpace(),
        threshold: 10 * 1024 * 1024 * 1024, // 10GB in bytes
        evaluationPeriods: 1,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        alarmDescription: 'Alert when database storage drops below 10GB',
      });

      new cloudwatch.Alarm(this, 'DatabaseConnectionsAlarm', {
        metric: this.database.metricDatabaseConnections(),
        threshold: 180,
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.BREACHING,
        alarmDescription: 'Alert when database connections exceed 180',
      });
    }

    // Create read replica for production
    if (environment === 'prod') {
      const readReplica = new rds.DatabaseInstanceReadReplica(this, 'ReadReplica', {
        sourceDatabaseInstance: this.database,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MEDIUM
        ),
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        securityGroups: [this.securityGroup],
        storageEncrypted: true,
        autoMinorVersionUpgrade: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      new cdk.CfnOutput(this, 'ReadReplicaEndpoint', {
        value: readReplica.instanceEndpoint.hostname,
        description: 'Read Replica Endpoint',
        exportName: `${appName}-${environment}-read-replica-endpoint`,
      });
    }

    // Output database information
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
      description: 'Database Endpoint',
      exportName: `${appName}-${environment}-db-endpoint`,
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.instanceEndpoint.port.toString(),
      description: 'Database Port',
      exportName: `${appName}-${environment}-db-port`,
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
      description: 'Database Secret ARN',
      exportName: `${appName}-${environment}-db-secret-arn`,
    });

    new cdk.CfnOutput(this, 'DatabaseSecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      description: 'Database Security Group ID',
      exportName: `${appName}-${environment}-db-sg-id`,
    });
  }
}