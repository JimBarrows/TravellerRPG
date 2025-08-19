import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigatewayAuthorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

export class InfrastructureStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly api: apigateway.HttpApi;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ============================================
    // Cognito User Pool for Authentication
    // ============================================
    this.userPool = new cognito.UserPool(this, 'TravellerUserPool', {
      userPoolName: 'traveller-rpg-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        gamemaster: new cognito.BooleanAttribute({ mutable: true }),
        preferredSystem: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // User Pool Client for Web Application
    this.userPoolClient = new cognito.UserPoolClient(this, 'TravellerWebClient', {
      userPool: this.userPool,
      userPoolClientName: 'traveller-web-client',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:5173/callback',
          'https://traveller-rpg.com/callback',
        ],
        logoutUrls: [
          'http://localhost:5173/logout',
          'https://traveller-rpg.com/logout',
        ],
      },
      refreshTokenValidity: cdk.Duration.days(30),
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      enableTokenRevocation: true,
      preventUserExistenceErrors: true,
    });

    // User Pool Domain for Hosted UI (optional)
    const userPoolDomain = new cognito.UserPoolDomain(this, 'TravellerUserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: 'traveller-rpg-auth',
      },
    });

    // ============================================
    // VPC for RDS Database
    // ============================================
    const vpc = new ec2.Vpc(this, 'TravellerVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Security Group for RDS
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for Traveller RPG database',
      allowAllOutbound: true,
    });

    // RDS PostgreSQL Database
    const databaseCredentials = new secretsmanager.Secret(this, 'DBCredentials', {
      description: 'Database credentials for Traveller RPG',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'travelleradmin' }),
        generateStringKey: 'password',
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    const database = new rds.DatabaseInstance(this, 'TravellerDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'traveller',
      credentials: rds.Credentials.fromSecret(databaseCredentials),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      multiAz: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });

    // ============================================
    // Lambda Functions
    // ============================================
    
    // Lambda Layer for shared dependencies
    const sharedDepsLayer = new lambda.LayerVersion(this, 'SharedDepsLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../layers/shared-deps')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared dependencies for Lambda functions',
    });

    // Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Grant Lambda access to database secrets
    databaseCredentials.grantRead(lambdaRole);

    // Environment variables for Lambda functions
    const lambdaEnvironment = {
      DATABASE_SECRET_ARN: databaseCredentials.secretArn,
      DATABASE_HOST: database.dbInstanceEndpointAddress,
      DATABASE_PORT: database.dbInstanceEndpointPort,
      DATABASE_NAME: 'traveller',
      USER_POOL_ID: this.userPool.userPoolId,
      USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
      NODE_ENV: 'production',
    };

    // GraphQL API Lambda
    const graphqlLambda = new lambdaNodeJs.NodejsFunction(this, 'GraphQLHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/graphql/index.ts'),
      handler: 'handler',
      environment: lambdaEnvironment,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [dbSecurityGroup],
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      layers: [sharedDepsLayer],
      bundling: {
        externalModules: ['aws-sdk', '@aws-sdk/*'],
        minify: true,
        sourceMap: true,
      },
    });

    // Allow Lambda to connect to RDS
    dbSecurityGroup.addIngressRule(
      dbSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to RDS'
    );

    // ============================================
    // API Gateway
    // ============================================
    
    // Cognito JWT Authorizer
    const authorizer = new apigatewayAuthorizers.HttpJwtAuthorizer(
      'JwtAuthorizer',
      `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`,
      {
        jwtAudience: [this.userPoolClient.userPoolClientId],
        identitySource: ['$request.header.Authorization'],
      }
    );

    // HTTP API
    this.api = new apigateway.HttpApi(this, 'TravellerAPI', {
      apiName: 'traveller-rpg-api',
      description: 'API for Traveller RPG application',
      corsPreflight: {
        allowOrigins: ['http://localhost:5173', 'https://traveller-rpg.com'],
        allowMethods: [
          apigateway.CorsHttpMethod.GET,
          apigateway.CorsHttpMethod.POST,
          apigateway.CorsHttpMethod.PUT,
          apigateway.CorsHttpMethod.DELETE,
          apigateway.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true,
      },
    });

    // GraphQL Route
    this.api.addRoutes({
      path: '/graphql',
      methods: [apigateway.HttpMethod.POST, apigateway.HttpMethod.GET],
      integration: new apigatewayIntegrations.HttpLambdaIntegration(
        'GraphQLIntegration',
        graphqlLambda
      ),
      authorizer,
    });

    // Health Check Route (public)
    const healthLambda = new lambda.Function(this, 'HealthCheckHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            body: JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
            headers: {
              'Content-Type': 'application/json',
            },
          };
        };
      `),
      handler: 'index.handler',
    });

    this.api.addRoutes({
      path: '/health',
      methods: [apigateway.HttpMethod.GET],
      integration: new apigatewayIntegrations.HttpLambdaIntegration(
        'HealthIntegration',
        healthLambda
      ),
    });

    // ============================================
    // S3 Buckets for Static Assets
    // ============================================
    
    // S3 bucket for web application
    const webBucket = new s3.Bucket(this, 'WebAppBucket', {
      bucketName: `traveller-rpg-web-${this.account}-${this.region}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      versioned: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    // S3 bucket for user uploads (character portraits, etc.)
    const uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `traveller-rpg-uploads-${this.account}-${this.region}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      versioned: true,
      lifecycleRules: [
        {
          id: 'delete-old-versions',
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['http://localhost:5173', 'https://traveller-rpg.com'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
        },
      ],
    });

    // ============================================
    // CloudFront Distribution
    // ============================================
    
    // Origin Access Identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for Traveller RPG web app',
    });

    // Grant CloudFront access to S3 buckets
    webBucket.grantRead(originAccessIdentity);
    uploadsBucket.grantRead(originAccessIdentity);

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'WebDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(webBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(
            `${this.api.apiId}.execute-api.${this.region}.amazonaws.com`
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
        '/uploads/*': {
          origin: new origins.S3Origin(uploadsBucket, {
            originAccessIdentity,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    // ============================================
    // Outputs
    // ============================================
    
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'TravellerUserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'TravellerUserPoolClientId',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.apiEndpoint,
      description: 'API Gateway URL',
      exportName: 'TravellerApiUrl',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront Distribution URL',
      exportName: 'TravellerCloudFrontUrl',
    });

    new cdk.CfnOutput(this, 'WebBucketName', {
      value: webBucket.bucketName,
      description: 'S3 Web Bucket Name',
      exportName: 'TravellerWebBucketName',
    });

    new cdk.CfnOutput(this, 'UploadsBucketName', {
      value: uploadsBucket.bucketName,
      description: 'S3 Uploads Bucket Name',
      exportName: 'TravellerUploadsBucketName',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.dbInstanceEndpointAddress,
      description: 'RDS Database Endpoint',
      exportName: 'TravellerDatabaseEndpoint',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: databaseCredentials.secretArn,
      description: 'Database Credentials Secret ARN',
      exportName: 'TravellerDatabaseSecretArn',
    });
  }
}