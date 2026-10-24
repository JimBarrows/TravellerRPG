import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';


export class CognitoStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // 1. Create the Cognito User Pool
        const userPool = new cognito.UserPool(this, 'TravellerRPGUserPool', {
            userPoolName: 'traveller-rpg-user-pool',
            selfSignUpEnabled: true, // Allow users to sign up themselves
            signInAliases: {
                email: true, // Allow signing in with email address
                username: false,
            },
            autoVerify: {
                email: true, // Automatically send verification email on sign-up
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production data safety
        });

        // 2. Create the User Pool Client (for web/mobile applications)
        const userPoolClient = new cognito.UserPoolClient(this, 'TravellerRPGUserPoolClient', {
            userPool,
            userPoolClientName: 'traveller-rpg-client',
            generateSecret: false, // Must be false for frontend/single-page apps (SPA)
            authFlows: {
                userSrp: true, // Secure Remote Password protocol (recommended)
            },
        });

        // 3. Export the IDs for your frontend environment configuration
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
        });
    }
}
