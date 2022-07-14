#!/bin/bash

# This script adds the Honeycomb integration layer on top of your functions, as a Lambda Layer.
# If you changed the function and/or stack names, make sure to update them below.
#
# Reference: https://github.com/honeycombio/honeycomb-lambda-extension

REGION="eu-north-1"
ARCH="x86_64"
VERSION="7"
HONEYCOMB_AWS_ACCOUNT_NR="702835727665"

functions=("serverless-observability-demo-greet-shared-Greet" "serverless-observability-demo-user-shared-GetUserName" "serverless-observability-demo-user-shared-LogGreetedUser")

for functionName in "${functions[@]}"; do
  aws lambda update-function-configuration \
    --function-name "$functionName" \
    --region $REGION \
    --layers "arn:aws:lambda:$REGION:$HONEYCOMB_AWS_ACCOUNT_NR:layer:honeycomb-lambda-extension-$ARCH:$VERSION"
done
