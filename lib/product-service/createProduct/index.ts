import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { WHITELISTED_ORIGINS } from "../../constants";

export default function createCreateProduct(
  scope: Construct,
  resource: apigateway.Resource,
  tables: Table[] = []
) {
  const createProductLambda = new NodejsFunction(scope, "createProductLambda", {
    runtime: lambda.Runtime.NODEJS_20_X,
    memorySize: 1024,
    timeout: cdk.Duration.seconds(5),
    handler: "createProduct",
    entry: path.join(__dirname, "handler.ts"),
  });

  const createProductIntegration = new apigateway.LambdaIntegration(
    createProductLambda,
    {
      requestTemplates: {
        "application/json": `{ "title": "$input.path('$.title')", "description": "$input.path('$.description')", "price": $input.path('$.price') }`,
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

  tables.forEach((table) => {
    table.grantWriteData(createProductLambda);
  });

  resource.addMethod("POST", createProductIntegration, {
    methodResponses,
  });

  resource.addCorsPreflight({
    allowOrigins: WHITELISTED_ORIGINS,
    allowMethods: ["POST"],
    allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"],
  });

  return {
    lambda: createProductLambda,
    integration: createProductIntegration,
    methodResponses,
  };
}
