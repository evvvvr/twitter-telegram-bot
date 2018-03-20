'use strict';

const moment = require('moment');
const AWS = require("aws-sdk");
const config = require('./config');

const sns = new AWS.SNS();

module.exports = event => {
  const {message} = event;
  const messageTime = moment.unix(message.date);
  const sinceWhen = moment().subtract(config.SinceWhen, 'milliseconds');

  if (messageTime.isBefore(sinceWhen)) {
    return Promise.resolve(null);
  }

  const { chat: { id: chatId }, from: { id: userId } } = message;

  const {cmd, text} = parseCommand(message) || {};

  if (!cmd) {
    return Promise.resolve(null);
  }

  console.log(`Received '${cmd}' command`);

  if (cmd === 'ping') {
    return executeCommand(cmd, {chatId, text});
  }

  return checkAuthorized(userId)
    .then(isAuthorizedAlready => {
      if (!isAuthorizedAlready) {
        console.log(`Not authorized\n`);
        return authorize();
      } else {
        console.log(`already authorized\n`);
        return true;
      }
    })
    .then(isAuthorized => {
      if (!isAuthorized) {
        return Promise.resolve({});
      }

      return executeCommand(cmd, {chatId, text});
    })
    .catch(e => {
      console.log(`Error\n`);
      console.dir(e);
      return sendMessage(chatId, 'Error happened while executing the command');
    });
};

function parseCommand (message) {
  const CmdRegExp = /\/(\w+)\s*([\s\S]*)/g;

  if (message) {
    const messageTime = moment.unix(message.date);
    const sinceWhen = moment().subtract(config.SinceWhen, 'milliseconds');

    if (messageTime.isSameOrAfter(sinceWhen)) {
      const cmdRegExpRes = CmdRegExp.exec(message.text);

      if (cmdRegExpRes) {
        return {
          cmd: cmdRegExpRes[1].toLowerCase(),
          text: cmdRegExpRes[2]
        };
      }
    }
  }

  return null;
}

function executeCommand (cmd, {chatId, text}) {
  switch (cmd) {
    case 'ping':
      return sendMessage(chatId, 'pong');

    case 'tweet':
      return tweet(chatId, text);
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

const docClient = new AWS.DynamoDB.DocumentClient();

function checkAuthorized (userId) {
  console.log(`checking if user ${userId} is authorized\n`);

  const params = {
    TableName : "authorizedUsers",
    KeyConditionExpression: "userId = :userId",
    FilterExpression: 'authorized = :authorized',
    ExpressionAttributeValues: {
      ":userId": userId,
      ":authorized": true
    }
  };

  return docClient.query(params).promise()
    .then(data => data.Count !== 0);
}

function authorize () {
  return Promise.resolve(true);
}
