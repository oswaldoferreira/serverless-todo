import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk-core'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly indexTable = process.env.TODOS_ID_INDEX,
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async updateTodo(userId: string, todoId: string, updateTodoItem: TodoUpdate): Promise<TodoUpdate> {
    const updatedAt = new Date().toISOString()
    const params = {
      TableName: this.todosTable,
      Key: { userId: userId, todoId: todoId },
      UpdateExpression: "SET updatedAt = :updatedAt",
      ExpressionAttributeValues: { ":updatedAt": updatedAt },
      ExpressionAttributeNames: {}
    }

    // Dynamically builds the set that needs update, ignoring empty objects.
    for (var key in updateTodoItem) {
      let val = updateTodoItem[key]

      if (val) {
        params.UpdateExpression += `, #${key} = :${key}`
        params.ExpressionAttributeValues[`:${key}`] = val
        params.ExpressionAttributeNames[`#${key}`] = key
      }
    }

    await this.docClient.update(params).promise()

    return updateTodoItem
  }

  async deleteTodo(todoId: string, userId: string) {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise()
  }

  async getTodosPerUser(userId: string): Promise<AWS.DynamoDB.DocumentClient.ItemList> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.indexTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
