import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importBucket = new s3.Bucket(this, "ImportBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Note: only use DESTROY for development
      autoDeleteObjects: true, // Note: only use autoDeleteObjects for development
    });

    new s3deploy.BucketDeployment(this, "CreateFolderStructure", {
      sources: [s3deploy.Source.data("uploaded/.keep", " ")],
      destinationBucket: importBucket,
    });
  }
}
