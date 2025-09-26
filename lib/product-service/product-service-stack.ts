import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import createApi from "./stack/api";
import createGetProductList from "./getProductList";
import { WHITELISTED_ORIGINS } from "../constants";
import createGetProductById from "./getProductById";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = createApi(this);

    const getProductList = createGetProductList(this);

    const productResource = api.root.addResource("product");

    const productAvailableResource = productResource.addResource("available");

    productAvailableResource.addMethod("GET", getProductList.integration, {
      methodResponses: getProductList.methodResponses,
    });

    productAvailableResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
      ],
    });

    const getProductById = createGetProductById(this);

    const productIdResource = productResource.addResource("{id}");

    productIdResource.addMethod("GET", getProductById.integration, {
      methodResponses: getProductById.methodResponses,
    });

    productIdResource.addCorsPreflight({
      allowOrigins: WHITELISTED_ORIGINS,
      allowMethods: ["GET"],
      allowHeaders: [
        "Content-Type",
        "X-Amz-Date",
        "Authorization",
        "X-Api-Key",
      ],
    });
  }
}
