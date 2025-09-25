import { Context } from "aws-lambda";
import { getProductsList } from "../../ProductService/ProductService";

export async function handler(event: any, context: Context) {
  return getProductsList();
}
