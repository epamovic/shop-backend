import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { Handler } from "aws-lambda";
import { PRODUCT_TABLE_NAME, STOCK_TABLE_NAME } from "../model";
import IAvailableProduct from "../types/IAvailableProduct";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const getProductById: Handler = async (
  event,
  context
): Promise<IAvailableProduct> => {
  const id = event.id;

  const getProductCommand = new GetItemCommand({
    TableName: PRODUCT_TABLE_NAME,
    Key: { id: { S: id } },
  });
  const getStockCommand = new GetItemCommand({
    TableName: STOCK_TABLE_NAME as string,
    Key: { product_id: { S: id } },
  });

  const [product, stock] = await Promise.all([
    dynamoDB.send(getProductCommand),
    dynamoDB.send(getStockCommand)
  ]);
  console.log("GetItem succeeded:", JSON.stringify(product, null, 2));
  console.log("GetItem succeeded:", JSON.stringify(stock, null, 2));

  if (product.Item && stock.Item) {
    return {
      id: product.Item.id.S as string,
      title: product.Item.title.S as string,
      description: product.Item.description.S as string,
      price: Number(product.Item.price.N),
      count: Number(stock.Item.count.N),
    };
  }
  throw new Error("Product not found");
};
