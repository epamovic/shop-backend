import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";

import { Construct } from "constructs";

export default function createGetProductsListIntegration(scope: Construct) {
  const getProductsListLambda = new lambda.Function(
    scope,
    "getProductsListLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    }
  );

  const getProductsListIntegration = new apigateway.LambdaIntegration(
    getProductsListLambda,
    {
      requestTemplates: {
        "application/json": `{ "message": "$input.params('message')" }`, // Map the query param message
      },
      integrationResponses: [
        {
          statusCode: "200",
        },
      ],
      proxy: false,
    }
  );
  return getProductsListIntegration;
}
