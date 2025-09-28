import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

export default function createGetProductList(scope: Construct) {
  const getProductListLambda = new NodejsFunction(
    scope,
    "getProductListLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "getProductList",
      entry: path.join(__dirname, "handler.ts"),
    }
  );

  const getProductListIntegration = new apigateway.LambdaIntegration(
    getProductListLambda,
    {
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
    lambda: getProductListLambda,
    integration: getProductListIntegration,
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
