#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service/product-service-stack";
import { TodoStack } from "../lib/todo/TodoStack";
import { HelloLambdaStack } from "../lib/hello-lambda/hello-lamba-stack";

const app = new cdk.App();

new HelloLambdaStack(app, "HelloLambdaStack", {});
new ProductServiceStack(app, "ProductLambdaStack", {});
new TodoStack(app, "TodoStack", {});
