import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const { appName, environment } = props;

    // Create Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${appName}-${environment}-user-pool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        'timezone': new cognito.StringAttribute({
          mutable: true,
        }),
        'subscription_tier': new cognito.StringAttribute({
          mutable: false,
        }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Add social identity providers
    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'Google', {
      clientId: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER',
      userPool: this.userPool,
      scopes: ['profile', 'email', 'openid'],
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        fullname: cognito.ProviderAttribute.GOOGLE_NAME,
        profilePicture: cognito.ProviderAttribute.GOOGLE_PICTURE,
      },
    });

    // Create app clients for web and mobile
    this.userPoolClient = new cognito.UserPoolClient(this, 'WebClient', {
      userPool: this.userPool,
      userPoolClientName: `${appName}-${environment}-web-client`,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.GOOGLE,
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
        callbackUrls: environment === 'prod'
          ? ['https://app.traveller-rpg.com/callback']
          : ['http://localhost:5173/callback'],
        logoutUrls: environment === 'prod'
          ? ['https://app.traveller-rpg.com']
          : ['http://localhost:5173'],
      },
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      accessTokenValidity: cdk.Duration.minutes(60),
      idTokenValidity: cdk.Duration.minutes(60),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    const mobileClient = new cognito.UserPoolClient(this, 'MobileClient', {
      userPool: this.userPool,
      userPoolClientName: `${appName}-${environment}-mobile-client`,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      preventUserExistenceErrors: true,
      enableTokenRevocation: true,
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // Create user groups for role-based access
    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admins',
      description: 'Administrator users',
      precedence: 1,
    });

    new cognito.CfnUserPoolGroup(this, 'GMGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'gamemasters',
      description: 'Game Master users',
      precedence: 10,
    });

    new cognito.CfnUserPoolGroup(this, 'PlayerGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'players',
      description: 'Player users',
      precedence: 20,
    });

    // Create subscription tier groups
    new cognito.CfnUserPoolGroup(this, 'FreeGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'tier_free',
      description: 'Free tier users',
      precedence: 100,
    });

    new cognito.CfnUserPoolGroup(this, 'StandardGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'tier_standard',
      description: 'Standard tier users ($4.99/month)',
      precedence: 90,
    });

    new cognito.CfnUserPoolGroup(this, 'PremiumGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'tier_premium',
      description: 'Premium tier users ($9.99/month)',
      precedence: 80,
    });

    // Create Identity Pool for AWS credentials
    this.identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: `${appName}_${environment}_identity_pool`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: this.userPoolClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName,
      }, {
        clientId: mobileClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName,
      }],
    });

    // Output important values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${appName}-${environment}-user-pool-id`,
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      description: 'Cognito User Pool ARN',
      exportName: `${appName}-${environment}-user-pool-arn`,
    });

    new cdk.CfnOutput(this, 'WebClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito Web Client ID',
      exportName: `${appName}-${environment}-web-client-id`,
    });

    new cdk.CfnOutput(this, 'MobileClientId', {
      value: mobileClient.userPoolClientId,
      description: 'Cognito Mobile Client ID',
      exportName: `${appName}-${environment}-mobile-client-id`,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'Cognito Identity Pool ID',
      exportName: `${appName}-${environment}-identity-pool-id`,
    });
  }
}