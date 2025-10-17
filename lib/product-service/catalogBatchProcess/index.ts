import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

export default function createCatalogBatchProcess(scope: Construct) {
  const catalogBatchProcessLambda = new NodejsFunction(
    scope,
    "catalogBatchProcessLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "catalogBatchProcess",
      entry: path.join(__dirname, "handler.ts"),
    }
  );

  return {
    lambda: catalogBatchProcessLambda,
  };
}
