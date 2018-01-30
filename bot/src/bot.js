'use strict';

const fetch = require('node-fetch');
const moment = require('moment');
const AWS = require("aws-sdk");
const config = require('./config');

const OkResponse = {
  statusCode: 200
};
const sns = new AWS.SNS();

module.exports = event => {
  const {message} = event;
  const {cmd, text} = getCommand(event.message) || {};

  if (cmd) {
    console.log(`Received '${cmd}' command`);

    let commandExecutor;
    switch (cmd) {
      case 'ping':
        commandExecutor = () => pong(message.chat.id);
        break;

      case 'tweet':
        commandExecutor = () => tweet(text);
        break;

      default:
        commandExecutor = () => unknowCommand(message.chat.id);
        break;
    }

    return commandExecutor();
  }

  throw new Error('No command');
};

function getCommand (message) {
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

function pong (chatId) {
  return sendMessage(chatId, 'pong')
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }

      return OkResponse;
    })
    .catch(err => {
      console.log(`Error sending message: ${err}`);
      throw err;
    });
}

function tweet (text) {
  return publishTweet(text)
    .then(() => {
      console.log('Tweet has been sent to be published');
      return OkResponse;
    })
    .catch(err => {
      console.log(`Error publishing tweet: ${err}`);
      throw err;
    });

  function publishTweet (text) {
    const params = {
      Message: text,
      TopicArn: config.WriteSnsARN
    };

    return sns.publish(params).promise();
  }
}

function unknowCommand (chatId) {
  return sendMessage(chatId, 'Unknown command')
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }

      return OkResponse;
    })
    .catch(err => {
      console.log(`Error sending message: ${err}`);
      throw err;
    });
}

function sendMessage (chatId, message) {
  const url = `https://api.telegram.org/bot${config.BotToken}/sendMessage`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });
}
