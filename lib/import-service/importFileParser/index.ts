import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

export default function createImportFileParser(scope: Construct) {
  const importFileParserLambda = new NodejsFunction(
    scope,
    "importFileParserLambda",
    {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10), // Increased timeout to allow time for SQS operations
      handler: "importFileParser",
      entry: path.join(__dirname, "handler.ts"),
    }
  );

  return {
    lambda: importFileParserLambda,
  };
}
