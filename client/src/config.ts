// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '05a02w17r7'
export const apiEndpoint = `https://${apiId}.execute-api.sa-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-todo-app.us.auth0.com',            // Auth0 domain
  clientId: 'RG4Eu7efJIIh5d1K0ufMYEIdUGTKE3AJ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
