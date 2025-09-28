#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service/product-service-stack";
import { TodoStack } from "../lib/todo/TodoStack";

const app = new cdk.App();

new ProductServiceStack(app, "ProductLambdaStack", {});
new TodoStack(app, "TodoStack", {});
