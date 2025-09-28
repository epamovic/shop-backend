import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import createApi from "./stack/api";
import createGetProductList from "./getProductList";
import { WHITELISTED_ORIGINS } from "../constants";
import createGetProductById from "./getProductById";
import createPrefillProducts from "./prefilTable";
import { createProductsTable, createStockTable } from "./model";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = createProductsTable(this);

    const stockTable = createStockTable(this);

    const prefillTable = createPrefillProducts(this);

    productsTable.grantWriteData(prefillTable.lambda);
    stockTable.grantWriteData(prefillTable.lambda);

    const api = createApi(this);

    const getProductList = createGetProductList(this);

    productsTable.grantReadData(getProductList.lambda);
    stockTable.grantReadData(getProductList.lambda);

    const productResource = api.root.addResource("product");

    const productAvailableResource = productResource.addResource("available");

    productAvailableResource.addMethod("GET", getProductList.integration, {
      methodResponses: getProductList.methodResponses,
    });

    productAvailableResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
      ],
    });

    const getProductById = createGetProductById(this);

    productsTable.grantReadData(getProductById.lambda);
    stockTable.grantReadData(getProductById.lambda);

    const productIdResource = productResource.addResource("{id}");

    productIdResource.addMethod("GET", getProductById.integration, {
      methodResponses: getProductById.methodResponses,
    });

    productIdResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
      ],
    });
  }
}
