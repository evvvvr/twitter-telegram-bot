'use strict';

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  getUserInfo (userId) {
    const params = {
      TableName : 'users',
      Key: {
        id: userId
      }
    };

    return docClient.get(params).promise().then(res => res.Item || null);
  }
};
