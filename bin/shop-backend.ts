#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service/product-service-stack";
import { TodoStack } from "../lib/todo/TodoStack";
import { HelloLambdaStack } from "../lib/hello-lambda/hello-lamba-stack";
import { HelloS3Stack } from "../lib/hello-s3/hello-s3-stack";
import { ImportServiceStack } from "../lib/import-service/import-service-stack";

const app = new cdk.App();

new HelloLambdaStack(app, "HelloLambdaStack", {});
new TodoStack(app, "TodoStack", {});
new HelloS3Stack(app, "HelloS3Stack", {});

new ProductServiceStack(app, "ProductLambdaStack", {});
new ImportServiceStack(app, "ImportServiceStack", {});
