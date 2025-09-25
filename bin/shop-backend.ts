#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductLambdaStack } from "../lib/product-lambda/product-lambda-stack";

const app = new cdk.App();

new ProductLambdaStack(app, "ProductLambdaStack", {});
