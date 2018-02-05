'use strict';

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
        commandExecutor = () => sendMessage(message.chat.id, 'pong');
        break;

      case 'tweet':
        commandExecutor = () => tweet(text);
        break;

      default:
        commandExecutor = () => sendMessage(message.chat.id, 'Unknown command');
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

function sendMessage (chatId, text) {
  const payload = JSON.stringify({chatId, text});
  const params = {
    Message: JSON.stringify({default: payload}),
    MessageStructure: 'json',
    TopicArn: config.SendSnsARN
  };

  return sns.publish(params).promise()
    .then(() => OkResponse)
    .catch(err => {
      console.log(`Error sending message: ${err}`);
      throw err;
    });
}
