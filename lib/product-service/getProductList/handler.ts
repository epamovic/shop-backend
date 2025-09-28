import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { Handler } from "aws-lambda";
import { PRODUCT_TABLE_NAME, STOCK_TABLE_NAME } from "../model";
import IAvailableProduct from "../types/IAvailableProduct";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

export const getProductList: Handler = async (
  event: any
): Promise<IAvailableProduct[]> => {
  const scanProductsCommand = new ScanCommand({
    TableName: PRODUCT_TABLE_NAME,
  });

  const scanStockCommand = new ScanCommand({
    TableName: STOCK_TABLE_NAME,
  });

  const [productsResult, stockResult] = await Promise.all([
    dynamoDB.send(scanProductsCommand),
    dynamoDB.send(scanStockCommand),
  ]);

  if (productsResult.Items && stockResult.Items) {
    const productItems = productsResult.Items || [];
    const stockItems = stockResult.Items || [];

    const stockMap: { [key: string]: number } = {};
    stockItems.forEach((stock) => {
      if (stock.product_id && stock.count) {
        stockMap[stock.product_id.S as string] = Number(stock.count.N);
      }
    });

    return productItems.map((product) => ({
      id: product.id.S as string,
      title: product.title.S as string,
      description: product.description.S as string,
      price: Number(product.price.N),
      count: stockMap[product.id.S as string] || 0,
    })) as IAvailableProduct[];
  }

  throw new Error("Products not found");
};
