'use strict';

const moment = require('moment');
const AWS = require("aws-sdk");
const config = require('./config');

const sns = new AWS.SNS();

module.exports = event => {
  const {message} = event;
  const messageTime = moment.unix(message.date);
  const sinceWhen = moment().subtract(config.SinceWhen, 'milliseconds');

  if (!messageTime.isSameOrAfter(sinceWhen)) {
    return;
  }

  const {cmd, text} = parseCommand(message) || {};
  const chatId = message.chat ? message.chat.id : null;

  if (cmd) {
    console.log(`Received '${cmd}' command`);

    if (cmd === 'ping') {
      return executeCommand(cmd, {chatId, text});
    }

    const isAuthorized = checkAuthorized();

    if (!isAuthorized) {
      return authorize().then(wasAuthorized => {
        if (wasAuthorized) {
          return executeCommand(cmd, {chatId, text});
        }
      });
    }
  }
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

function checkAuthorized () {
  return false;
}

function authorize () {
  return Promise.resolve(true);
}

