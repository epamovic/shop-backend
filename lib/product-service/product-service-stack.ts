import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as sns from "aws-cdk-lib/aws-sns";
import createApi from "./stack/api";
import createGetProductList from "./getProductList";
import createGetProductById from "./getProductById";
import createPrefillProducts from "./prefilTable";
import { createProductsTable, createStockTable } from "./model";
import createCreateProduct from "./createProduct";
import createCatalogBatchProcess from "./catalogBatchProcess";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = createProductsTable(this);

    const stockTable = createStockTable(this);

    createPrefillProducts(this, [productsTable, stockTable]);

    const api = createApi(this, "Shop Product Api");

    const productResource = api.root.addResource("product");

    createCreateProduct(this, productResource, [productsTable, stockTable]);

    const productAvailableResource = productResource.addResource("available");

    createGetProductList(this, productAvailableResource, [
      productsTable,
      stockTable,
    ]);

    const productIdResource = productResource.addResource("{id}");

    createGetProductById(this, productIdResource, [productsTable, stockTable]);

    const productSqs = new sqs.Queue(this, "catalogItemsQueue", {
      visibilityTimeout: cdk.Duration.seconds(30),
      receiveMessageWaitTime: cdk.Duration.seconds(20),
      retentionPeriod: cdk.Duration.days(4),
    });

    // Export the queue ARN for other stacks to use
    new cdk.CfnOutput(this, "CatalogItemsQueueArnOutput", {
      value: productSqs.queueArn,
      exportName: "CatalogItemsQueueArn",
    });

    // Export the queue URL for other stacks to use
    new cdk.CfnOutput(this, "CatalogItemsQueueUrlOutput", {
      value: productSqs.queueUrl,
      exportName: "CatalogItemsQueueUrl",
    });

    // Create SNS topic for product creation notifications
    const productTopic = new sns.Topic(this, "createProductTopic", {
      displayName: "Product Creation Notifications",
    });

    // Add email subscription to the SNS topic
    new sns.Subscription(this, "ProductTopicEmailSubscription", {
      topic: productTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: "juraj_pejnovic@epam.com", // Replace with your actual email
    });

    // Export the SNS topic ARN for other stacks to use
    new cdk.CfnOutput(this, "CreateProductTopicArnOutput", {
      value: productTopic.topicArn,
      exportName: "CreateProductTopicArn",
    });

    const catalogBatchProcess = createCatalogBatchProcess(this);

    productTopic.grantPublish(catalogBatchProcess.lambda);
    productsTable.grantWriteData(catalogBatchProcess.lambda);
    stockTable.grantWriteData(catalogBatchProcess.lambda);

    catalogBatchProcess.lambda.addEnvironment(
      "PRODUCT_SNS_TOPIC_ARN", // Changed to match the variable used in handler.ts
      productTopic.topicArn
    );

    catalogBatchProcess.lambda.addEventSource(
      new SqsEventSource(productSqs, {
        batchSize: 5,
      })
    );
  }
}
