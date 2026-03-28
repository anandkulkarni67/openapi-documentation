# Automatic generation of routes and documentation using decorators in Typescript.

## Run the api locally
```
cd api
npm install
npm run build

AWS_SAM:
sam local start-api --template-file serverless.yaml
sample http request: http://127.0.0.1:3000/v1/healthcheck/app

NPM:
npm run serve
sample http request: http://localhost:3000/v1/healthcheck/app
```

## AWS Resource creation and deletion on local machine
```
From the root directory,

Run following command to create aws resources.
./setup-local-environment.sh

Run following command to tead down aws resources.
./tear-down-local-environment.sh

```

## Github integration for cloud
```
1. Install AWS CLI on local machine and configure aws credentials and run following command to create a
   stack to install resources related to github oidc authentication.
   ./aws-resources/github-oidc/scripts/deploy ${github-username}
   OR
   Go to AWS console and create a stack with following parameters.
   - Application name - same as the one in package.json in the root directory.
   - Github Username - Github username
   - Github Repository - Github repository name
2. Go to the source code github repository.
3. Click on Settings.
4. Click on Environments on the side panel and create a 'production' environment.
5. Create three secret environment variables.
   AWS_REGION ( AWS region in which resources are deployed )
   AWS_ACCOUNT_ID ( ID of the AWS account where resources are deployed )
   OIDC_ROLE_NAME ( you can find this value in the output of 'security' cloudformation stack )
```

## AWS Resource creation in cloud
```
1. Go to github actions.
2. Click on Deploy a project.
3. Select following options:
  - Branch: main
  - Job: deploy-aws-resources
  - release: any one the available ones in the dropdown. 
```

## API Documentation
```
AWS: https://{Apigw-id}.execute-api.{region}.amazonaws.com/{stage}/api-docs/
AWS_SAM: http://127.0.0.1:3000/api-docs/
Local: http://localhost:3000/api-docs/
```
