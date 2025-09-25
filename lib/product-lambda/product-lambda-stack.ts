// Filename: hello-lambda-stack.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import createGetProductListIntegration from "./getProductList";
import createGetProductsByIdIntegration from "./getProductById";
import createApi from "./stack/api";

const WHITELISTED_ORIGINS = ["https://your-frontend-url.com"];

export class ProductLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductListIntegration = createGetProductListIntegration(this);

    const getProductByIdIntegration = createGetProductsByIdIntegration(this);

    const api = createApi(this);

    const productResource = api.root.addResource("product");

    productResource.addMethod("GET", getProductListIntegration);
    productResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
    });

    const productByIdResource = productResource.addResource("{id}");

    productByIdResource.addMethod("GET", getProductByIdIntegration);
    productByIdResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
    });
  }
}
