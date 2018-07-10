'use strict';

const AWS = require('aws-sdk');
const { sendMessage } = require('send-api');
const config = require('../config');

const sns = new AWS.SNS();

module.exports = (chatId, tweet) => {
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
};

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

