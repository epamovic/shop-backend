import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import { WHITELISTED_ORIGINS } from "../../constants";

export default function createImportProductsFile(
  scope: Construct,
  resource: apigateway.Resource
) {
  const importProductsFileLambda = new NodejsFunction(
    scope,
    "importProductsFileLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "importProductsFile",
      entry: path.join(__dirname, "handler.ts"),
    }
  );

  const importProductsFileIntegration = new apigateway.LambdaIntegration(
    importProductsFileLambda,
    {
      requestTemplates: {
        "application/json": `{ "name": "$input.params().querystring.name" }`, // Map the query string parameter
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

  resource.addMethod("GET", importProductsFileIntegration, {
    methodResponses,
  });

  resource.addCorsPreflight({
    allowOrigins: WHITELISTED_ORIGINS,
    allowMethods: ["GET"],
    allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
  });

  return {
    lambda: importProductsFileLambda,
    integration: importProductsFileIntegration,
    methodResponses,
  };
}
