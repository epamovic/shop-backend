import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

export default function createPrefillProducts(scope: Construct) {
  const prefillProductsLambda = new NodejsFunction(
    scope,
    "prefillProductsLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "prefillProducts",
      entry: path.join(__dirname, "handler.ts"),
    }
  );

  return {
    lambda: prefillProductsLambda,
  };
}
