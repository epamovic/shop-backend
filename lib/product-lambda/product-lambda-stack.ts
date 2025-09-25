import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import path from "path";
import createApi from "./stack/api";
import createGetProductList from "./getProductList";
import { WHITELISTED_ORIGINS } from "../constants";

export class ProductLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductList = createGetProductList(this);

    const api = createApi(this);

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
  }
}
