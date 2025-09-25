import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib";
import * as path from "path";

import { Construct } from "constructs";
import { WHITELISTED_ORIGINS } from "../../constants";

export default function createGetProductListIntegration(
  scope: Construct,
  logGroup: logs.LogGroup
) {
  const getProductListLambda = new lambda.Function(
    scope,
    "getProductListLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      logGroup,
    }
  );

  const getProductListIntegration = new apigateway.LambdaIntegration(
    getProductListLambda,
    {
      requestTemplates: {
        "application/json": `{}`,
      },
      integrationResponses: [
        {
          statusCode: "200",
          responseTemplates: {
            "application/json": "$input.path('$.body')", // Extract the body from the Lambda response
          },
          responseParameters: {
            "method.response.header.Content-Type": "'application/json'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
        },
        {
          statusCode: "500",
          selectionPattern: ".*Error.*",
          responseTemplates: {
            "application/json": "$input.path('$.body')", // Extract the body from the Lambda response
          },
          responseParameters: {
            "method.response.header.Content-Type": "'application/json'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
          },
        },
      ],
      proxy: false,
    }
  );
  return {
    integration: getProductListIntegration,
    methodResponses: [
      {
        statusCode: "200",
        responseParameters: {
          "method.response.header.Content-Type": true,
          "method.response.header.Access-Control-Allow-Origin": true,
        },
        responseModels: {
          "application/json": apigateway.Model.EMPTY_MODEL,
        },
      },
      {
        statusCode: "500",
        responseParameters: {
          "method.response.header.Content-Type": true,
          "method.response.header.Access-Control-Allow-Origin": true,
        },
        responseModels: {
          "application/json": apigateway.Model.ERROR_MODEL,
        },
      },
    ],
  };
}
