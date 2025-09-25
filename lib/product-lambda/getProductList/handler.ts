import { Context } from "aws-lambda";
import IAvailableProduct from "../../ProductService/IAvailableProduct";

const mockProducts: Record<string, IAvailableProduct> = {
  "1": {
    id: "1",
    title: "Product 1",
    description: "Description for Product 1",
    price: 100,
    count: 10,
  },
  "2": {
    id: "2",
    title: "Product 2",
    description: "Description for Product 2",
    price: 200,
    count: 20,
  },
  "3": {
    id: "3",
    title: "Product 3",
    description: "Description for Product 3",
    price: 300,
    count: 30,
  },
};

export async function getProductsList() {
  return Object.values(mockProducts);
}

export async function handler(_event: any, _context: Context) {
  try {
    const products = await getProductsList();
    return {
      statusCode: 200,
      body: JSON.stringify(products),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Error getting products list:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
}
