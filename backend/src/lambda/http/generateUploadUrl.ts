import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk-core'
import { getUserId } from '../utils'
import * as uuid from 'uuid'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const todo = getTodo(userId, todoId)

  if (!todo) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const imageId = uuid.v4()
  const uploadUrl = getUploadUrl(imageId)
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

  // TODO: Move it outta here
  const params = {
    TableName: todosTable,
    Key: { userId: userId, todoId: todoId },
    UpdateExpression: "SET attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues: { ":attachmentUrl": attachmentUrl },
  }

  // Could this be moved to a S3 callback (post upload)? 
  await docClient.update(params).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}

async function getTodo(todoId: string, userId: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })
    .promise()

  console.log('Get todo: ', result)
  return result.Item
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}