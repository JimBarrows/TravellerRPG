import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface ConfigStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
}

export class ConfigStack extends cdk.Stack {
  public readonly parameters: { [key: string]: ssm.IParameter };
  public readonly secrets: { [key: string]: secretsmanager.ISecret };

  constructor(scope: Construct, id: string, props: ConfigStackProps) {
    super(scope, id, props);

    const { appName, environment } = props;

    // Initialize parameter and secret maps
    this.parameters = {};
    this.secrets = {};

    // Database configuration parameters
    this.parameters.dbName = new ssm.StringParameter(this, 'DbNameParameter', {
      parameterName: `/${appName}/${environment}/database/name`,
      stringValue: 'travellerrpg',
      description: 'Database name for the Traveller RPG application',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.parameters.dbPort = new ssm.StringParameter(this, 'DbPortParameter', {
      parameterName: `/${appName}/${environment}/database/port`,
      stringValue: '5432',
      description: 'Database port for PostgreSQL',
      tier: ssm.ParameterTier.STANDARD,
    });

    // API configuration parameters
    this.parameters.corsOrigins = new ssm.StringListParameter(this, 'CorsOriginsParameter', {
      parameterName: `/${appName}/${environment}/api/cors-origins`,
      stringListValue: environment === 'prod' 
        ? ['https://travellerrpg.com', 'https://www.travellerrpg.com']
        : ['http://localhost:3000', 'http://localhost:8080'],
      description: 'CORS allowed origins for the API',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.parameters.jwtExpiry = new ssm.StringParameter(this, 'JwtExpiryParameter', {
      parameterName: `/${appName}/${environment}/auth/jwt-expiry`,
      stringValue: environment === 'prod' ? '24h' : '7d',
      description: 'JWT token expiration time',
      tier: ssm.ParameterTier.STANDARD,
    });

    // Feature flags
    this.parameters.enableAdvancedCharGen = new ssm.StringParameter(this, 'EnableAdvancedCharGenParameter', {
      parameterName: `/${appName}/${environment}/features/advanced-character-generation`,
      stringValue: environment === 'prod' ? 'false' : 'true',
      description: 'Enable advanced character generation features',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.parameters.enableVirtualTabletop = new ssm.StringParameter(this, 'EnableVirtualTabletopParameter', {
      parameterName: `/${appName}/${environment}/features/virtual-tabletop`,
      stringValue: 'true',
      description: 'Enable virtual tabletop features',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.parameters.enableAiGameMaster = new ssm.StringParameter(this, 'EnableAiGameMasterParameter', {
      parameterName: `/${appName}/${environment}/features/ai-game-master`,
      stringValue: environment === 'prod' ? 'false' : 'true',
      description: 'Enable AI Game Master features',
      tier: ssm.ParameterTier.STANDARD,
    });

    // Performance and scaling parameters
    this.parameters.maxConcurrentUsers = new ssm.StringParameter(this, 'MaxConcurrentUsersParameter', {
      parameterName: `/${appName}/${environment}/performance/max-concurrent-users`,
      stringValue: environment === 'prod' ? '1000' : '100',
      description: 'Maximum concurrent users supported',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.parameters.lambdaTimeout = new ssm.StringParameter(this, 'LambdaTimeoutParameter', {
      parameterName: `/${appName}/${environment}/lambda/timeout`,
      stringValue: environment === 'prod' ? '300' : '900',
      description: 'Default Lambda function timeout in seconds',
      tier: ssm.ParameterTier.STANDARD,
    });

    // Monitoring and logging parameters
    this.parameters.logLevel = new ssm.StringParameter(this, 'LogLevelParameter', {
      parameterName: `/${appName}/${environment}/logging/level`,
      stringValue: environment === 'prod' ? 'WARN' : 'DEBUG',
      description: 'Application log level',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.parameters.enableDetailedMonitoring = new ssm.StringParameter(this, 'EnableDetailedMonitoringParameter', {
      parameterName: `/${appName}/${environment}/monitoring/detailed`,
      stringValue: environment === 'prod' ? 'true' : 'false',
      description: 'Enable detailed CloudWatch monitoring',
      tier: ssm.ParameterTier.STANDARD,
    });

    // External service configuration (secure parameters)
    this.secrets.googleOAuthClient = new secretsmanager.Secret(this, 'GoogleOAuthClientSecret', {
      secretName: `/${appName}/${environment}/auth/google-oauth-client-secret`,
      description: 'Google OAuth client secret for authentication',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ clientId: '' }),
        generateStringKey: 'clientSecret',
        excludeCharacters: '"@/\\',
      },
    });

    this.secrets.facebookOAuthClient = new secretsmanager.Secret(this, 'FacebookOAuthClientSecret', {
      secretName: `/${appName}/${environment}/auth/facebook-oauth-client-secret`,
      description: 'Facebook OAuth client secret for authentication',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ appId: '' }),
        generateStringKey: 'appSecret',
        excludeCharacters: '"@/\\',
      },
    });

    this.secrets.appleOAuthClient = new secretsmanager.Secret(this, 'AppleOAuthClientSecret', {
      secretName: `/${appName}/${environment}/auth/apple-oauth-client-secret`,
      description: 'Apple OAuth client secret for authentication',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ clientId: '' }),
        generateStringKey: 'clientSecret',
        excludeCharacters: '"@/\\',
      },
    });

    // API keys for external services
    this.secrets.openAiApiKey = new secretsmanager.Secret(this, 'OpenAiApiKeySecret', {
      secretName: `/${appName}/${environment}/external/openai-api-key`,
      description: 'OpenAI API key for AI features',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'apiKey',
        excludeCharacters: '"@/\\',
      },
    });

    this.secrets.stripeApiKey = new secretsmanager.Secret(this, 'StripeApiKeySecret', {
      secretName: `/${appName}/${environment}/payment/stripe-api-key`,
      description: 'Stripe API key for payment processing',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ publishableKey: '' }),
        generateStringKey: 'secretKey',
        excludeCharacters: '"@/\\',
      },
    });

    // Email service configuration
    this.parameters.emailFromAddress = new ssm.StringParameter(this, 'EmailFromAddressParameter', {
      parameterName: `/${appName}/${environment}/email/from-address`,
      stringValue: environment === 'prod' 
        ? 'noreply@travellerrpg.com'
        : 'dev-noreply@travellerrpg.com',
      description: 'Default from email address',
      tier: ssm.ParameterTier.STANDARD,
    });

    this.secrets.sendGridApiKey = new secretsmanager.Secret(this, 'SendGridApiKeySecret', {
      secretName: `/${appName}/${environment}/email/sendgrid-api-key`,
      description: 'SendGrid API key for email services',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'apiKey',
        excludeCharacters: '"@/\\',
      },
    });

    // Create outputs for parameter references
    new cdk.CfnOutput(this, 'ParameterStorePrefix', {
      value: `/${appName}/${environment}`,
      description: 'Parameter Store prefix for this environment',
      exportName: `${appName}-${environment}-parameter-prefix`,
    });

    // Export all parameter ARNs for cross-stack references
    Object.entries(this.parameters).forEach(([name, parameter]) => {
      new cdk.CfnOutput(this, `${name}ParameterArn`, {
        value: parameter.parameterArn,
        description: `Parameter ARN for ${name}`,
        exportName: `${appName}-${environment}-${name}-parameter-arn`,
      });
    });

    // Export all secret ARNs for cross-stack references
    Object.entries(this.secrets).forEach(([name, secret]) => {
      new cdk.CfnOutput(this, `${name}SecretArn`, {
        value: secret.secretArn,
        description: `Secret ARN for ${name}`,
        exportName: `${appName}-${environment}-${name}-secret-arn`,
      });
    });

    // Create a helper function output for Lambda environment variables
    const lambdaEnvVars = {
      NODE_ENV: environment,
      APP_NAME: appName,
      PARAMETER_STORE_PREFIX: `/${appName}/${environment}`,
      LOG_LEVEL: this.parameters.logLevel.parameterName,
      JWT_EXPIRY: this.parameters.jwtExpiry.parameterName,
      MAX_CONCURRENT_USERS: this.parameters.maxConcurrentUsers.parameterName,
      LAMBDA_TIMEOUT: this.parameters.lambdaTimeout.parameterName,
      EMAIL_FROM_ADDRESS: this.parameters.emailFromAddress.parameterName,
      ENABLE_ADVANCED_CHAR_GEN: this.parameters.enableAdvancedCharGen.parameterName,
      ENABLE_VIRTUAL_TABLETOP: this.parameters.enableVirtualTabletop.parameterName,
      ENABLE_AI_GAME_MASTER: this.parameters.enableAiGameMaster.parameterName,
      ENABLE_DETAILED_MONITORING: this.parameters.enableDetailedMonitoring.parameterName,
    };

    new cdk.CfnOutput(this, 'LambdaEnvironmentVariables', {
      value: JSON.stringify(lambdaEnvVars),
      description: 'Environment variables configuration for Lambda functions',
      exportName: `${appName}-${environment}-lambda-env-vars`,
    });

    // Tags for parameter management
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('Application', appName);
    cdk.Tags.of(this).add('Stack', 'Config');
  }

  /**
   * Get a parameter by name with proper error handling
   */
  getParameter(name: string): ssm.IParameter {
    const parameter = this.parameters[name];
    if (!parameter) {
      throw new Error(`Parameter '${name}' not found in ConfigStack`);
    }
    return parameter;
  }

  /**
   * Get a secret by name with proper error handling
   */
  getSecret(name: string): secretsmanager.ISecret {
    const secret = this.secrets[name];
    if (!secret) {
      throw new Error(`Secret '${name}' not found in ConfigStack`);
    }
    return secret;
  }

  /**
   * Grant read access to all parameters for a given construct
   */
  grantParametersRead(grantee: cdk.aws_iam.IGrantable): void {
    Object.values(this.parameters).forEach(parameter => {
      parameter.grantRead(grantee);
    });
  }

  /**
   * Grant read access to all secrets for a given construct
   */
  grantSecretsRead(grantee: cdk.aws_iam.IGrantable): void {
    Object.values(this.secrets).forEach(secret => {
      secret.grantRead(grantee);
    });
  }

  /**
   * Grant read access to both parameters and secrets for a given construct
   */
  grantConfigRead(grantee: cdk.aws_iam.IGrantable): void {
    this.grantParametersRead(grantee);
    this.grantSecretsRead(grantee);
  }
}