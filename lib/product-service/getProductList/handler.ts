import IAvailableProduct from "../types/IAvailableProduct";

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

export async function handler(event: any) {
  const products = await getProductsList();

  return products;
}
