import { Context } from "aws-lambda";
import { getProductById } from "../../ProductService/ProductService";

export async function handler(event: any, context: Context) {
  return getProductById(event.id);
}
