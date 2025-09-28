import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export const PRODUCT_TABLE_NAME = "products";
export const STOCK_TABLE_NAME = "stock";

export function createProductsTable(scope: Construct) {
  return new dynamodb.Table(scope, PRODUCT_TABLE_NAME, {
    tableName: PRODUCT_TABLE_NAME,
    partitionKey: {
      name: "id",
      type: dynamodb.AttributeType.STRING,
    },
    sortKey: {
      name: "title",
      type: dynamodb.AttributeType.STRING,
    },
  });
}

export function createStockTable(scope: Construct) {
  return new dynamodb.Table(scope, STOCK_TABLE_NAME, {
    tableName: STOCK_TABLE_NAME,
    partitionKey: {
      name: "product_id",
      type: dynamodb.AttributeType.STRING,
    },
  });
}
