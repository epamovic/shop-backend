import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export default function createApi(scope: Construct) {
  const api = new apigateway.RestApi(scope, "my-api", {
    restApiName: "My API Gateway",
    description: "This API serves the Lambda functions.",
  });

  return api;
}
