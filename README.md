# Serverless TODO

This project uses serverless.com to package and deploy the application to AWS using:

- S3
- Lambda functions
- DynamoDB
- API Gateway
- IAM roles

The goal of the project was to play with AWS services, mainly exploring the potential of setting up serverless environments using
the serverless framework.

This project is part of a Udacity course.

## Setup

Make sure you already have AWS credentials setup in your machine, then go through the following. AWS resources will be 
generated automatically through Cloud Formation.

### Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

### Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```