// Filename: hello-lambda-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import createGetProductsListIntegration from "./getProductsList";
import createGetProductsByIdIntegration from "./getProductsById";
import createApi from "./stack/api";

const WHITELISTED_ORIGINS = ["https://your-frontend-url.com"];

export class ProductsLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListIntegration = createGetProductsListIntegration(this);

    const getProductByIdIntegration = createGetProductsByIdIntegration(this);

    const api = createApi(this);

    const productsResource = api.root.addResource("products");

    productsResource.addMethod("GET", getProductsListIntegration);
    productsResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
    });

    const productByIdResource = productsResource.addResource("{id}");

    productByIdResource.addMethod("GET", getProductByIdIntegration);
    productByIdResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
    });
  }
}
