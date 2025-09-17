#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { HelloLambdaStack } from "../lib/hello-lambda/hello-lamba-stack";

const app = new cdk.App();

new HelloLambdaStack(app, "HelloLambdaStack", {});
