import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export default function createApi(
  scope: Construct,
  options?: apigateway.RestApiProps
) {
  const api = new apigateway.RestApi(scope, "my-api", {
    restApiName: "Shop Product Api",
    description: "This API serves the Lambda functions for products.",
    ...options,
  });

  return api;
}
