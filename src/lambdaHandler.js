const awsServerlessExpress = require('aws-serverless-express');
const app = require('./index');

const server = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2)); // Debug log
    return awsServerlessExpress.proxy(server, event, context);
};
