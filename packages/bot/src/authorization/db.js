'use strict';

const AWS = require('aws-sdk');
const ConversationPhase = require('../conversationPhase');

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  saveAuthorizationStarted (userId, cmd, arg) {
    const params = {
      TableName : 'users',
      Item: {
        id: userId,
        authorized: false,
        conversationPhase: ConversationPhase.AUTHORIZATION,
        command: cmd !== 'authorize' ? cmd : null,
        argument: cmd !== 'authorize' && arg ? arg : null
      }
    };

    return docClient.put(params).promise();
  },

  saveAuthorizationFailed (userId) {
    const params = {
      TableName : 'users',
      Key: { id: userId },
      AttributeUpdates: {
        conversationPhase: {
          Action: 'DELETE'
        },
        command: {
          Action: 'DELETE'
        },
        argument: {
          Action: 'DELETE'
        }
      }
    };

    return docClient.update(params).promise();
  },

  saveAuthorizationSucceeded (userId) {
    const params = {
      TableName : 'users',
      Key: { id: userId },
      AttributeUpdates: {
        authorized: {
          Action: 'PUT',
          Value: true
        },
        conversationPhase: {
          Action: 'PUT',
          Value: ConversationPhase.RECIEVING_COMMANDS
        },
        command: {
          Action: 'DELETE'
        },
        argument: {
          Action: 'DELETE'
        }
      }
    };

    return docClient.update(params).promise();
  }
};
