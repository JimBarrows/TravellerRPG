import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
  userPool: cognito.UserPool;
  database: rds.DatabaseInstance;
  databaseSecret: cdk.aws_secretsmanager.Secret;
  databaseSecurityGroup: ec2.SecurityGroup;
}

export class ApiStack extends cdk.Stack {
  public readonly graphqlApi: appsync.GraphqlApi;
  public readonly apiKey: appsync.CfnApiKey;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { appName, environment, userPool, database, databaseSecret, databaseSecurityGroup } = props;

    // Create CloudWatch log group for API
    const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: `/aws/appsync/${appName}-${environment}`,
      retention: environment === 'prod' 
        ? logs.RetentionDays.THREE_MONTHS 
        : logs.RetentionDays.ONE_WEEK,
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Create GraphQL API
    this.graphqlApi = new appsync.GraphqlApi(this, 'GraphQLApi', {
      name: `${appName}-${environment}-api`,
      schema: appsync.SchemaFile.fromAsset(
        path.join(__dirname, '..', '..', 'schema', 'schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
            defaultAction: appsync.UserPoolDefaultAction.ALLOW,
          },
        },
        additionalAuthorizationModes: [{
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            name: `${appName}-${environment}-api-key`,
            description: 'API Key for development and testing',
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        }],
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR,
        role: new iam.Role(this, 'ApiLogRole', {
          assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
          managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppSyncPushToCloudWatchLogs'),
          ],
        }),
      },
      xrayEnabled: environment === 'prod',
    });

    // Create Lambda data source for complex resolvers
    const resolverLambda = new lambda.Function(this, 'ResolverFunction', {
      functionName: `${appName}-${environment}-resolver`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'lambda', 'resolvers')),
      environment: {
        NODE_ENV: environment,
        DATABASE_SECRET_ARN: databaseSecret.secretArn,
        DATABASE_NAME: 'travellerrpg',
      },
      vpc: database.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [databaseSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      memorySize: environment === 'prod' ? 1024 : 512,
      tracing: lambda.Tracing.ACTIVE,
      logRetention: environment === 'prod'
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK,
    });

    // Grant Lambda access to database secret
    databaseSecret.grantRead(resolverLambda);

    // Allow Lambda to connect to database
    databaseSecurityGroup.addIngressRule(
      databaseSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to database'
    );

    // Create Lambda data source
    const lambdaDs = this.graphqlApi.addLambdaDataSource(
      'LambdaDataSource',
      resolverLambda,
      {
        name: 'LambdaDataSource',
        description: 'Lambda resolver for complex operations',
      }
    );

    // Create DynamoDB tables for real-time data (sessions, active games)
    const sessionsTable = new cdk.aws_dynamodb.Table(this, 'SessionsTable', {
      tableName: `${appName}-${environment}-sessions`,
      partitionKey: {
        name: 'campaignId',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sessionId',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: cdk.aws_dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      encryption: cdk.aws_dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: environment === 'prod',
      removalPolicy: environment === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Add global secondary index for user sessions
    sessionsTable.addGlobalSecondaryIndex({
      indexName: 'UserSessionsIndex',
      partitionKey: {
        name: 'userId',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'timestamp',
        type: cdk.aws_dynamodb.AttributeType.NUMBER,
      },
    });

    // Create DynamoDB data source
    const dynamoDs = this.graphqlApi.addDynamoDbDataSource(
      'SessionsDataSource',
      sessionsTable,
      {
        name: 'SessionsDataSource',
        description: 'DynamoDB data source for sessions',
      }
    );

    // Create None data source for local resolvers
    const noneDs = this.graphqlApi.addNoneDataSource('NoneDataSource', {
      name: 'NoneDataSource',
      description: 'Local resolver for computed fields',
    });

    // Configure resolvers (these would be defined in separate resolver files)
    // Query resolvers
    lambdaDs.createResolver('GetUserResolver', {
      typeName: 'Query',
      fieldName: 'getUser',
    });

    lambdaDs.createResolver('GetCampaignResolver', {
      typeName: 'Query',
      fieldName: 'getCampaign',
    });

    lambdaDs.createResolver('GetCharacterResolver', {
      typeName: 'Query',
      fieldName: 'getCharacter',
    });

    lambdaDs.createResolver('ListCampaignsResolver', {
      typeName: 'Query',
      fieldName: 'listCampaigns',
    });

    // Mutation resolvers
    lambdaDs.createResolver('CreateCampaignResolver', {
      typeName: 'Mutation',
      fieldName: 'createCampaign',
    });

    lambdaDs.createResolver('CreateCharacterResolver', {
      typeName: 'Mutation',
      fieldName: 'createCharacter',
    });

    lambdaDs.createResolver('UpdateCharacterResolver', {
      typeName: 'Mutation',
      fieldName: 'updateCharacter',
    });

    // Subscription resolvers for real-time updates
    dynamoDs.createResolver('OnSessionUpdateResolver', {
      typeName: 'Subscription',
      fieldName: 'onSessionUpdate',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    // Create API key for development
    this.apiKey = new appsync.CfnApiKey(this, 'ApiKey', {
      apiId: this.graphqlApi.apiId,
      description: 'API Key for development and testing',
      expires: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
    });

    // Output API information
    new cdk.CfnOutput(this, 'GraphQLApiUrl', {
      value: this.graphqlApi.graphqlUrl,
      description: 'GraphQL API URL',
      exportName: `${appName}-${environment}-api-url`,
    });

    new cdk.CfnOutput(this, 'GraphQLApiId', {
      value: this.graphqlApi.apiId,
      description: 'GraphQL API ID',
      exportName: `${appName}-${environment}-api-id`,
    });

    new cdk.CfnOutput(this, 'GraphQLApiKey', {
      value: this.apiKey.attrApiKey,
      description: 'GraphQL API Key',
      exportName: `${appName}-${environment}-api-key`,
    });
  }
}