#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "../lib/product-service/product-service-stack";
import { TodoStack } from "../example/todo/TodoStack";
import { HelloLambdaStack } from "../example/hello-lambda/hello-lamba-stack";
import { HelloS3Stack } from "../example/hello-s3/hello-s3-stack";
import { ImportServiceStack } from "../lib/import-service/import-service-stack";
import { ProductSqsStack } from "../example/product-sqs/product-sqs-stack";
import { ProductSnsStack } from "../example/product-sns/product-sns-stack";

const app = new cdk.App();

new HelloLambdaStack(app, "HelloLambdaStack", {});
new TodoStack(app, "TodoStack", {});
new HelloS3Stack(app, "HelloS3Stack", {});
new ProductSqsStack(app, "ProductSqsStack", {});
new ProductSnsStack(app, "ProductSnsStack", {});

new ProductServiceStack(app, "ProductLambdaStack", {});
new ImportServiceStack(app, "ImportServiceStack", {});
