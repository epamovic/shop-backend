import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Handler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { PRODUCT_TABLE_NAME, STOCK_TABLE_NAME } from "../model";
import IAvailableProduct from "../types/IAvailableProduct";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const createProduct: Handler = async (
  event,
  context
): Promise<IAvailableProduct> => {
  try {
    const id = uuidv4();

    console.log("Event:", JSON.stringify(event, null, 2));

    const putProductCommand = new PutItemCommand({
      TableName: PRODUCT_TABLE_NAME,
      Item: {
        id: { S: id },
        title: { S: event.title },
        description: { S: event.description },
        price: { N: event.price.toString() },
      },
    });

    const putStockCommand = new PutItemCommand({
      TableName: STOCK_TABLE_NAME,
      Item: {
        product_id: { S: id },
        count: { N: "0" },
      },
    });

    const [productResult, stockResult] = await Promise.all([
      dynamoDB.send(putProductCommand),
      dynamoDB.send(putStockCommand),
    ]);

    const result: IAvailableProduct = {
      id,
      title: event.title,
      description: event.description,
      price: event.price,
      count: 0,
    };

    console.log("PutItem succeeded:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error adding item to DynamoDB table");
  }
};
