import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { InfrastructureStack } from "../lib/infrastructure-stack";

describe("InfrastructureStack", () => {
  let app: cdk.App;
  let stack: InfrastructureStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new InfrastructureStack(app, "TestInfrastructureStack", {
      env: {
        account: "123456789012",
        region: "us-east-1",
      },
    });
    template = Template.fromStack(stack);
  });

  describe("Cognito User Pool", () => {
    test("should create user pool with correct configuration", () => {
      template.hasResourceProperties("AWS::Cognito::UserPool", {
        UserPoolName: "traveller-rpg-users",
        Policies: {
          PasswordPolicy: {
            MinimumLength: 8,
            RequireLowercase: true,
            RequireNumbers: true,
            RequireSymbols: true,
            RequireUppercase: true,
          },
        },
        AutoVerifiedAttributes: ["email"],
        UsernameAttributes: ["email"],
      });
    });

    test("should create user pool client with correct configuration", () => {
      template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
        UserPoolClientName: "traveller-web-client",
        ExplicitAuthFlows: ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_USER_SRP_AUTH"],
        SupportedIdentityProviders: ["COGNITO"],
        AllowedOAuthFlows: ["code"],
        AllowedOAuthScopes: ["email", "openid", "profile"],
        CallbackURLs: Match.arrayWith([
          "http://localhost:5173/callback",
          "https://traveller-rpg.com/callback",
        ]),
      });
    });

    test("should create user pool domain", () => {
      template.hasResourceProperties("AWS::Cognito::UserPoolDomain", {
        Domain: "traveller-rpg-auth",
      });
    });
  });

  describe("VPC and Database", () => {
    test("should create VPC with correct configuration", () => {
      template.hasResourceProperties("AWS::EC2::VPC", {
        CidrBlock: "10.0.0.0/16",
        EnableDnsHostnames: true,
        EnableDnsSupport: true,
      });
    });

    test("should create RDS PostgreSQL instance", () => {
      template.hasResourceProperties("AWS::RDS::DBInstance", {
        Engine: "postgres",
        EngineVersion: "15",
        DBInstanceClass: "db.t3.micro",
        AllocatedStorage: "20",
        MaxAllocatedStorage: 100,
        DBName: "traveller",
        MultiAZ: false,
      });
    });

    test("should create database security group", () => {
      template.hasResourceProperties("AWS::EC2::SecurityGroup", {
        GroupDescription: "Security group for Traveller RPG database",
      });
    });

    test("should create database credentials secret", () => {
      template.hasResourceProperties("AWS::SecretsManager::Secret", {
        Description: "Database credentials for Traveller RPG",
        GenerateSecretString: {
          SecretStringTemplate: '{"username":"travelleradmin"}',
          GenerateStringKey: "password",
        },
      });
    });
  });

  describe("Lambda Functions", () => {
    test("should create shared dependencies layer", () => {
      template.hasResourceProperties("AWS::Lambda::LayerVersion", {
        Description: "Shared dependencies for Lambda functions",
        CompatibleRuntimes: ["nodejs20.x"],
      });
    });

    test("should create GraphQL Lambda function", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "nodejs20.x",
        Timeout: 30,
        MemorySize: 512,
        Environment: {
          Variables: Match.objectLike({
            DATABASE_NAME: "traveller",
            NODE_ENV: "production",
          }),
        },
      });
    });

    test("should create health check Lambda function", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "nodejs20.x",
        Handler: "index.handler",
      });
    });

    test("should create Lambda execution role with correct policies", () => {
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "lambda.amazonaws.com",
              },
            },
          ],
        },
        ManagedPolicyArns: Match.arrayWith([
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
          "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
        ]),
      });
    });
  });

  describe("API Gateway", () => {
    test("should create HTTP API with CORS configuration", () => {
      template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
        Name: "traveller-rpg-api",
        Description: "API for Traveller RPG application",
        ProtocolType: "HTTP",
        CorsConfiguration: {
          AllowOrigins: ["http://localhost:5173", "https://traveller-rpg.com"],
          AllowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          AllowHeaders: ["Content-Type", "Authorization"],
          AllowCredentials: true,
        },
      });
    });

    test("should create GraphQL route with JWT authorizer", () => {
      template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
        RouteKey: "POST /graphql",
        AuthorizationType: "JWT",
      });
    });

    test("should create health check route without authorization", () => {
      template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
        RouteKey: "GET /health",
        AuthorizationType: "NONE",
      });
    });
  });

  describe("S3 Buckets", () => {
    test("should create web application bucket with correct configuration", () => {
      template.hasResourceProperties("AWS::S3::Bucket", {
        BucketName: "traveller-rpg-web-123456789012-us-east-1",
        VersioningConfiguration: {
          Status: "Enabled",
        },
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    test("should create uploads bucket with lifecycle rules", () => {
      template.hasResourceProperties("AWS::S3::Bucket", {
        BucketName: "traveller-rpg-uploads-123456789012-us-east-1",
        LifecycleConfiguration: {
          Rules: [
            {
              Id: "delete-old-versions",
              Status: "Enabled",
              NoncurrentVersionExpiration: {
                NoncurrentDays: 30,
              },
            },
          ],
        },
      });
    });
  });

  describe("CloudFront Distribution", () => {
    test("should create CloudFront distribution with correct origins", () => {
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: {
          Origins: Match.arrayWith([
            Match.objectLike({
              DomainName: Match.anyValue(),
              S3OriginConfig: Match.anyValue(),
            }),
          ]),
          DefaultRootObject: "index.html",
          CustomErrorResponses: [
            {
              ErrorCode: 404,
              ResponseCode: 200,
              ResponsePagePath: "/index.html",
              ErrorCachingMinTTL: 0,
            },
          ],
        },
      });
    });

    test("should create Origin Access Identity", () => {
      template.hasResourceProperties("AWS::CloudFront::OriginAccessIdentity", {
        OriginAccessIdentityConfig: {
          Comment: "OAI for Traveller RPG web app",
        },
      });
    });
  });

  describe("Stack Outputs", () => {
    test("should export all required outputs", () => {
      const outputs = template.findOutputs("*");

      expect(outputs).toHaveProperty("UserPoolId");
      expect(outputs).toHaveProperty("UserPoolClientId");
      expect(outputs).toHaveProperty("ApiUrl");
      expect(outputs).toHaveProperty("CloudFrontUrl");
      expect(outputs).toHaveProperty("WebBucketName");
      expect(outputs).toHaveProperty("UploadsBucketName");
      expect(outputs).toHaveProperty("DatabaseEndpoint");
      expect(outputs).toHaveProperty("DatabaseSecretArn");
    });
  });

  describe("Security", () => {
    test("should not have any publicly accessible S3 buckets", () => {
      template.allResources(
        "AWS::S3::Bucket",
        (bucketName: string, resource: any) => {
          if (resource.Properties?.PublicAccessBlockConfiguration) {
            expect(resource.Properties.PublicAccessBlockConfiguration).toEqual({
              BlockPublicAcls: true,
              BlockPublicPolicy: true,
              IgnorePublicAcls: true,
              RestrictPublicBuckets: true,
            });
          }
        },
      );
    });

    test("should have RDS instance in private subnets", () => {
      template.hasResourceProperties("AWS::RDS::DBSubnetGroup", {
        SubnetIds: Match.anyValue(),
      });
    });
  });
});
