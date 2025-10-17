import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { Handler } from "aws-lambda";
import IAvailableProduct from "../types/IAvailableProduct";
import { PRODUCT_TABLE_NAME, STOCK_TABLE_NAME } from "../model";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const getProductById: Handler = async (
  event,
  context
): Promise<IAvailableProduct> => {
  console.log("GetProductById event: ", JSON.stringify(event, null, 2));

  const id = event.id;

  if (!id) {
    throw new Error("Missing 'id' path parameter");
  }

  const getProductCommand = new GetItemCommand({
    TableName: PRODUCT_TABLE_NAME,
    Key: { id: id },
  });
  const getStockCommand = new GetItemCommand({
    TableName: STOCK_TABLE_NAME,
    Key: { product_id: id },
  });

  try {
    const product = await dynamoDB.send(getProductCommand);
    console.log("GetItem succeeded:", JSON.stringify(product.Item, null, 2));

    const stock = await dynamoDB.send(getStockCommand);
    console.log("GetItem succeeded:", JSON.stringify(stock.Item, null, 2));

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
  } catch (error) {
    console.error("Error fetching product or stock:", error);
    throw new Error("Error fetching product or stock");
  }
};
