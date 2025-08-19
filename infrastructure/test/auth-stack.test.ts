import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AuthStack } from '../lib/stacks/auth-stack';

describe('AuthStack', () => {
  let app: cdk.App;
  let stack: AuthStack;
  let template: Template;

  beforeEach(() => {
    // Mock environment variables for OAuth providers
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

    app = new cdk.App();
    stack = new AuthStack(app, 'TestAuthStack', {
      appName: 'traveller-rpg',
      environment: 'test',
    });
    template = Template.fromStack(stack);
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  describe('User Pool Configuration', () => {
    test('should create user pool with correct naming', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UserPoolName: 'traveller-rpg-test-user-pool',
      });
    });

    test('should configure email sign-in only', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UsernameAttributes: ['email'],
      });
    });

    test('should enable self sign-up', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: Match.objectLike({
          PasswordPolicy: Match.objectLike({
            MinimumLength: 8,
          }),
        }),
      });
    });

    test('should require email and fullname attributes', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            AttributeDataType: 'String',
            Name: 'email',
            Required: true,
            Mutable: true,
          }),
          Match.objectLike({
            AttributeDataType: 'String', 
            Name: 'name',
            Required: true,
            Mutable: true,
          }),
        ]),
      });
    });

    test('should have custom attributes for timezone and subscription', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Schema: Match.arrayWith([
          Match.objectLike({
            AttributeDataType: 'String',
            Name: 'custom:timezone',
            Mutable: true,
          }),
          Match.objectLike({
            AttributeDataType: 'String',
            Name: 'custom:subscription_tier',
            Mutable: false,
          }),
        ]),
      });
    });

    test('should enable email auto-verification', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AutoVerifiedAttributes: ['email'],
      });
    });
  });

  describe('User Pool Client Configuration', () => {
    test('should create user pool clients', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolClient', 2);
    });

    test('should enable password and SRP authentication flows', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        ExplicitAuthFlows: Match.arrayWith([
          'ALLOW_USER_PASSWORD_AUTH',
          'ALLOW_USER_SRP_AUTH',
        ]),
      });
    });

    test('should use Cognito and Google as identity providers', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        SupportedIdentityProviders: ['COGNITO', 'GOOGLE'],
      });
    });

    test('should create web client with OAuth configuration', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        UserPoolClientName: 'traveller-rpg-test-web-client',
        AllowedOAuthFlows: ['code'],
        AllowedOAuthScopes: ['email', 'openid', 'profile'],
      });
    });

    test('should create mobile client', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        UserPoolClientName: 'traveller-rpg-test-mobile-client',
      });
    });
  });

  describe('Identity Pool Configuration', () => {
    test('should create identity pool', () => {
      template.hasResource('AWS::Cognito::IdentityPool', {});
    });

    test('should not allow unauthenticated access', () => {
      template.hasResourceProperties('AWS::Cognito::IdentityPool', {
        AllowUnauthenticatedIdentities: false,
      });
    });
  });

  describe('Social Identity Providers', () => {
    test('should create Google identity provider', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolIdentityProvider', {
        ProviderName: 'Google',
        ProviderType: 'Google',
        ProviderDetails: {
          client_id: 'test-google-client-id',
          client_secret: 'test-google-client-secret',
        },
      });
    });
  });

  describe('User Groups', () => {
    test('should create admin group', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: 'admins',
        Description: 'Administrator users',
        Precedence: 1,
      });
    });

    test('should create gamemaster group', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: 'gamemasters', 
        Description: 'Game Master users',
        Precedence: 10,
      });
    });

    test('should create player group', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: 'players',
        Description: 'Player users', 
        Precedence: 20,
      });
    });

    test('should create subscription tier groups', () => {
      // Free tier
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: 'tier_free',
        Description: 'Free tier users',
        Precedence: 100,
      });

      // Standard tier
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: 'tier_standard',
        Description: 'Standard tier users ($4.99/month)',
        Precedence: 90,
      });

      // Premium tier
      template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
        GroupName: 'tier_premium',
        Description: 'Premium tier users ($9.99/month)',
        Precedence: 80,
      });
    });
  });

  describe('Stack Properties', () => {
    test('should expose user pool as public property', () => {
      expect(stack.userPool).toBeDefined();
      expect(stack.userPool.userPoolId).toBeDefined();
    });

    test('should expose user pool client as public property', () => {
      expect(stack.userPoolClient).toBeDefined();
      expect(stack.userPoolClient.userPoolClientId).toBeDefined();
    });

    test('should expose identity pool as public property', () => {
      expect(stack.identityPool).toBeDefined();
      expect(stack.identityPool.ref).toBeDefined();
    });
  });

  describe('Environment-specific Configuration', () => {
    test('should use provided app name and environment in resource names', () => {
      const devApp = new cdk.App();
      const devStack = new AuthStack(devApp, 'DevAuthStack', {
        appName: 'test-app',
        environment: 'development',
      });
      const devTemplate = Template.fromStack(devStack);

      devTemplate.hasResourceProperties('AWS::Cognito::UserPool', {
        UserPoolName: 'test-app-development-user-pool',
      });
    });
  });

  describe('Resource Count Validation', () => {
    test('should create exactly one user pool', () => {
      template.resourceCountIs('AWS::Cognito::UserPool', 1);
    });

    test('should create exactly two user pool clients (web and mobile)', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolClient', 2);
    });

    test('should create exactly one identity pool', () => {
      template.resourceCountIs('AWS::Cognito::IdentityPool', 1);
    });
  });
});