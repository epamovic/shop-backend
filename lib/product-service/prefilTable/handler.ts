// Filename: Todo/handler.ts
import { Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { PREFILL_PRODUCTS } from "./constants";
import { PRODUCT_TABLE_NAME, STOCK_TABLE_NAME } from "../model";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const productTableName = PRODUCT_TABLE_NAME as string;
const stockTableName = STOCK_TABLE_NAME as string;

export const prefillProducts: Handler = async (event, context) => {
  try {
    const results = Promise.all(
      PREFILL_PRODUCTS.map(async (product) => {
        const id = uuidv4();
        const productTableCommand = new PutItemCommand({
          TableName: productTableName,
          Item: {
            id: { S: id },
            title: { S: product.title },
            description: { S: product.description },
            price: { N: product.price.toString() },
          },
        });
        const productResult = await dynamoDB.send(productTableCommand);

        console.log(
          "PutItem succeeded:",
          JSON.stringify(productResult, null, 2)
        );

        const stockTableCommand = new PutItemCommand({
          TableName: stockTableName,
          Item: {
            product_id: { S: id },
            count: { N: product.stock.toString() },
          },
        });
        const stockResult = await dynamoDB.send(stockTableCommand);

        console.log("PutItem succeeded:", JSON.stringify(stockResult, null, 2));

        return { productResult, stockResult };
      })
    );
    return results;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error adding item to DynamoDB table");
  }
};
