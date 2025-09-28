import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import createApi from "./stack/api";
import createGetProductList from "./getProductList";
import { WHITELISTED_ORIGINS } from "../constants";
import createGetProductById from "./getProductById";
import createPrefillProducts from "./prefilTable";
import { createProductsTable, createStockTable } from "./model";
import createCreateProduct from "./createProduct";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = createProductsTable(this);

    const stockTable = createStockTable(this);

    createPrefillProducts(this, [productsTable, stockTable]);

    const api = createApi(this);

    const productResource = api.root.addResource("product");

    createCreateProduct(this, productResource, [productsTable, stockTable]);

    const productAvailableResource = productResource.addResource("available");

    createGetProductList(this, productAvailableResource, [
      productsTable,
      stockTable,
    ]);

    const productIdResource = productResource.addResource("{id}");

    createGetProductById(this, productIdResource, [productsTable, stockTable]);
  }
}
