import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";

import { Construct } from "constructs";

export default function createGetProductsByIdIntegration(scope: Construct) {
  const getProductByIdLambda = new lambda.Function(
    scope,
    "getProductByIdLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    }
  );

  const getProductByIdIntegration = new apigateway.LambdaIntegration(
    getProductByIdLambda,
    {
      requestTemplates: {
        "application/json": `{ "id": "$input.params('id')" }`, // Map the path param id
      },
      integrationResponses: [
        {
          statusCode: "200",
        },
      ],
      proxy: false,
    }
  );

  return getProductByIdIntegration;
}
