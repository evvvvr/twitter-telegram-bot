'use strict';

const AWS = require("aws-sdk");
const Twitter = require('twitter');
const config = require('./config');

const sns = new AWS.SNS();

const twitterClient = new Twitter({
  consumer_key: config.ConsumerKey,
  consumer_secret: config.ConsumerSecret,
  access_token_key: config.AccessToken,
  access_token_secret: config.AccessTokenSecret
});

module.exports = (chatId, text) => {
  console.log(`Publishing tweet`);

  return tweet(text)
    .then(() => {
      console.log(`Tweet published`);
      return sendMessage(chatId, 'Tweet published');
    })
    .catch(err => {
      console.log(`Error publishing tweet:`);
      console.dir(err);
      return sendMessage(chatId, `Error publishing tweet`);
    });
};

function tweet (status) {
  return twitterClient.post('statuses/update', { status });
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
