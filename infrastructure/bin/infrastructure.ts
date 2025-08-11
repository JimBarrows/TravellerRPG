#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TravellerInfrastructureStack } from '../lib/traveller-infrastructure-stack';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || 'dev';
const appName = 'TravellerRPG';

// Environment-specific configuration
const envConfig = {
  dev: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  staging: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  prod: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
};

// Create the infrastructure stack
new TravellerInfrastructureStack(app, `${appName}InfrastructureStack`, {
  appName,
  environment,
  stackName: `${appName}-${environment}-infrastructure`,
  env: envConfig[environment as keyof typeof envConfig],
  tags: {
    Application: appName,
    Environment: environment,
    ManagedBy: 'AWS CDK',
  },
});

// Add global tags
cdk.Tags.of(app).add('Application', appName);
cdk.Tags.of(app).add('Environment', environment);
cdk.Tags.of(app).add('ManagedBy', 'AWS CDK');