import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as path from "node:path";
import { Construct } from "constructs";
import createApi from "../product-service/stack/api";
import createImportProductsFile from "./importProductsFile";
import createImportFileParser from "./importFileParser";
import { WHITELISTED_ORIGINS } from "../constants";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Add reference to the basicAuthorizer lambda
    const basicAuthorizer = new cdk.aws_lambda.Function(
      this,
      "BasicAuthorizerLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
        handler: "basicAuthorizerHandler.basicAuthorizer",
        code: cdk.aws_lambda.Code.fromAsset(
          path.join(__dirname, "../authorization-service")
        ),
        environment: {
          TEST_USER_CREDENTIALS: "{your_github_account_login}=TEST_PASSWORD", // Replace with your actual GitHub login
        },
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
      }
    );

    const importBucket = new s3.Bucket(this, "ImportBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Note: only use DESTROY for development
      autoDeleteObjects: true, // Note: only use autoDeleteObjects for development
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: WHITELISTED_ORIGINS,
          exposedHeaders: ["ETag", "x-amz-meta-custom-header"],
          maxAge: 3000,
        },
      ],
    });

    new s3deploy.BucketDeployment(this, "CreateFolderStructure", {
      sources: [s3deploy.Source.data("uploaded/.keep", " ")],
      destinationBucket: importBucket,
    });

    const api = createApi(this, "Shop Import Api");

    const importResource = api.root.addResource("import");

    // Create Lambda authorizer for /import path
    const lambdaAuthorizer = new cdk.aws_apigateway.TokenAuthorizer(
      this,
      "ImportLambdaAuthorizer",
      {
        handler: basicAuthorizer,
        identitySource: "method.request.header.Authorization",
      }
    );

    const importProductsFile = createImportProductsFile(
      this,
      importResource,
      lambdaAuthorizer
    );

    importBucket.grantReadWrite(importProductsFile.lambda);

    importProductsFile.lambda.addEnvironment(
      "BUCKET_NAME",
      importBucket.bucketName
    );

    const importFileParser = createImportFileParser(this);

    importBucket.grantReadWrite(importFileParser.lambda);

    importFileParser.lambda.addEnvironment(
      "BUCKET_NAME",
      importBucket.bucketName
    );

    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser.lambda),
      { prefix: "uploaded/" } // This filters for objects in the "uploaded/" folder
    );

    // Get reference to the existing SQS queue from the ProductServiceStack
    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      "ImportToCatalogQueue",
      cdk.Fn.importValue("CatalogItemsQueueArn") // This assumes the queue ARN is exported in the ProductServiceStack
    );

    // Grant permission to send messages to the queue
    catalogItemsQueue.grantSendMessages(importFileParser.lambda);

    // Add the queue URL as an environment variable for the lambda
    importFileParser.lambda.addEnvironment(
      "CATALOG_ITEMS_QUEUE_URL",
      catalogItemsQueue.queueUrl
    );
  }
}
