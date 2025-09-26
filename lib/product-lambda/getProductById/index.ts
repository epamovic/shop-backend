import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";

import { Construct } from "constructs";

export default function createGetProductsById(scope: Construct) {
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
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
            "method.response.header.Access-Control-Allow-Methods":
              "'GET,OPTIONS'",
          },
        },
      ],
      proxy: false,
    }
  );

  return {
    integration: getProductByIdIntegration,
    methodResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Origin": true,
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
        },
      },
    ],
  };
}
