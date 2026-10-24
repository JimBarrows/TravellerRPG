import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import {CognitoStack} from "./cognito-stack";

export class TravellerRpgStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cognitoStack = new CognitoStack(this, 'CognitoStack');
  }
}
