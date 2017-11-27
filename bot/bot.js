'use strict';

console.log('Loading function\n');

const fetch = require('node-fetch');
const moment = require('moment');
const AWS = require("aws-sdk");

// config
const BotToken = process.env.BOT_TOKEN;
const SinceWhen = process.env.SINCE_WHEN;
const WriteSnsARN = process.env.WRITE_SNS_ARN;

const response = {
  statusCode: 200
};

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const message = event.message;
  if (message) {
    const messageTime = moment.unix(message.date);
    const sinceWhen = moment().subtract(SinceWhen, 'milliseconds');

    if (messageTime.isSameOrAfter(sinceWhen)) {
      const CmdRegExp = /\/(\w+)\s*([\s\S]*)/g;
      const cmdRegExpRes = CmdRegExp.exec(message.text);

      if (cmdRegExpRes) {
        const cmd = cmdRegExpRes[1].toLowerCase();
        const text = cmdRegExpRes[2];

        switch (cmd) {
          case 'ping':
            return sendMessage(message.chat.id, 'pong')
              .then(res => {
                if (!res.ok) {
                  throw Error(res.statusText);
                }

                console.log('Message posted')
                return callback(null, response);
              })
              .catch(err => {
                console.log(`Error: ${err}`);
                return callback(err);
              });

          case 'tweet':
            console.log(`Tweet! ${text}`);
            return publishTweet(text)
              .then(() => {
                return callback(null, response);
              })
              .catch(err => {
                console.log(`Error: ${err}`);
                return callback(err);
              });
        }
      }
    }
  }

  return callback(null, response);
};

function sendMessage (chatId, message) {
  const url = `https://api.telegram.org/bot${BotToken}/sendMessage`;

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

const sns = new AWS.SNS();

function publishTweet (text) {
  const params = {
    Message: text, 
    TopicArn: WriteSnsARN
  };

  return sns.publish(params).promise();
}
