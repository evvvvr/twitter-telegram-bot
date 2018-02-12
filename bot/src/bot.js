'use strict';

const moment = require('moment');
const AWS = require("aws-sdk");
const config = require('./config');

const sns = new AWS.SNS();

module.exports = event => {
  const {message} = event;
  const {cmd, text} = getCommand(event.message) || {};

  if (cmd) {
    console.log(`Received '${cmd}' command`);

    switch (cmd) {
      case 'ping':
        return sendMessage(message.chat.id, 'pong');

      case 'tweet':
        return tweet(message.chat.id, text);
    }

    return sendMessage(message.chat.id, 'Unknown command');
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

function tweet (chatId, tweet) {
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
