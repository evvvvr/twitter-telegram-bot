'use strict';

const moment = require('moment');
const AWS = require("aws-sdk");
const bcrypt = require('bcryptjs');
const config = require('./config');

const sns = new AWS.SNS();
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = event => {
  const {message} = event;
  const messageTime = moment.unix(message.date);
  const sinceWhen = moment().subtract(config.SinceWhen, 'milliseconds');

  if (messageTime.isBefore(sinceWhen)) {
    return Promise.resolve(null);
  }

  const { chat: { id: chatId }, from: { id: userId }, text } = message;
  const {cmd, arg} = parseCommand(message) || {};

  if (cmd) {
    console.log(`Received '${cmd}' command from user ${userId}`);
  }

  if (cmd === 'ping') { // no authorization required
    return executeCommand(cmd, arg, {chatId});
  }

  return getUserInfo(userId).then(userInfo => {
    if (!userInfo) {
      if (!cmd) {
        return Promise.resolve();
      }

      console.log(`No user info for user ${userId}`);

      const params = {
        TableName : 'users',
        Item: {
          id: userId,
          authorized: false,
          conversationPhase: 'AUTHORIZATION',
          command: cmd !== 'authorize' ? cmd : null,
          argument: cmd !== 'authorize' ? arg : null
        }
      };

      return docClient.put(params).promise()
        .then(() => sendMessage(chatId, 'Enter password'));
      // if can't prompt to enter password - rollback prev steps
    }

    const {authorized, conversationPhase, command: prevCmd, argument: prevArg} =
      userInfo;

    if (!authorized) {
      console.log(`User ${userId} is not authorized`);

      if (conversationPhase !== 'AUTHORIZATION') {
        if (!cmd) {
          return Promise.resolve();
        }

        const params = {
          TableName : 'users',
          Item: {
            id: userId,
            authorized: false,
            conversationPhase: 'AUTHORIZATION',
            command: cmd !== 'authorize' ? cmd : null,
            argument: cmd !== 'authorize' ? arg : null
          }
        };

        return docClient.put(params).promise()
          .then(() => sendMessage(chatId, 'Enter password'));
        // if can't prompt to enter passwprd - rollback prev steps
      }

      // authorization
      const passwordsMatch = bcrypt.compareSync(text, config.PasswordHash);

      if (!passwordsMatch) {
        console.log(`Failed authorization attempt for user ${userId}`);

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

        return docClient.update(params).promise()
          .then(() => sendMessage(chatId, 'Invalid password'));
      }

      console.log(`User ${userId} successfully authorized`);

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
            Value: 'RECIEVING_COMMANDS'
          },
          command: {
            Action: 'DELETE'
          },
          argument: {
            Action: 'DELETE'
          }
        }
      };

      return docClient.update(params).promise()
        .then(() => {
          if (prevCmd) {
            return executeCommand(prevCmd, prevArg, {chatId});
          }

          return sendMessage(chatId, 'You are authorized');
        });
    }

    // user is authorized
    if (!cmd) {
      return Promise.resolve();
    }

    if (cmd === 'authorize') {
      return sendMessage(chatId, 'You are authorized already');
    }

    console.log(`Executing ${cmd} command`);
    return executeCommand(cmd, arg, {chatId});
  });
};

function parseCommand (message) {
  if (message) {
    const CmdRegExp = /^\/(\w+)\s*([\s\S]*)/g;
    const cmdRegExpRes = CmdRegExp.exec(message.text);

    if (cmdRegExpRes) {
      return {
        cmd: cmdRegExpRes[1].toLowerCase(),
        arg: cmdRegExpRes[2]
      };
    }
  }

  return null;
}

function executeCommand (cmd, arg, {chatId}) {
  switch (cmd) {
    case 'ping':
      return sendMessage(chatId, 'pong');

    case 'tweet':
      return tweet(chatId, arg);
  }

  return sendMessage(chatId, 'Unknown command');
}

function tweet (chatId, tweet) {
  if (!tweet) {
    console.log(`Tweet can't be published: no text`);
    return sendMessage(chatId, 'No tweet text');
  }

  return publishTweet(chatId, tweet)
    .then(() => {
      console.log('Tweet has been sent to be published');
    })
    .catch(err => {
      console.log(`Error publishing tweet: ${err}`);
      throw err;
    });

  function publishTweet (chatId, tweet) {
    const payload = JSON.stringify({chatId, tweet});

    const params = {
      Message: JSON.stringify({default: payload}),
      MessageStructure: 'json',
      TopicArn: config.WriteSnsARN
    };

    return sns.publish(params).promise()
      .catch(err => {
        console.log(`Error publishing tweet: ${err}`);
        throw err;
      });
  }
}

function sendMessage (chatId, text) {
  const payload = JSON.stringify({chatId, text});
  const params = {
    Message: JSON.stringify({default: payload}),
    MessageStructure: 'json',
    TopicArn: config.SendSnsARN
  };

  return sns.publish(params).promise()
    .catch(err => {
      console.log(`Error sending message: ${err}`);
      throw err;
    });
}

function getUserInfo (userId) {
  const params = {
    TableName : 'users',
    Key: {
      id: userId
    }
  };

  return docClient.get(params).promise().then(res => res.Item || null);
}
