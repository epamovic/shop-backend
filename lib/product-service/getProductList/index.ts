import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { WHITELISTED_ORIGINS } from "../../constants";

export default function createGetProductList(
  scope: Construct,
  resource: apigateway.Resource,
  tables: Table[] = []
) {
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

  const methodResponses = [
    {
      statusCode: "200",
      responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": true,
        "method.response.header.Access-Control-Allow-Headers": true,
        "method.response.header.Access-Control-Allow-Methods": true,
      },
    },
  ];

  tables.forEach((table) => {
    table.grantReadData(getProductListLambda);
  });

  resource.addMethod("GET", getProductListIntegration, {
    methodResponses,
  });

  resource.addCorsPreflight({
    allowOrigins: WHITELISTED_ORIGINS,
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
  });

  return {
    lambda: getProductListLambda,
    integration: getProductListIntegration,
    methodResponses,
  };
}
