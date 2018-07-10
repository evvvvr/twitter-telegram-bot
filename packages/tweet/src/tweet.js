'use strict';

const Twitter = require('twitter');
const { sendMessage } = require('send-api');
const config = require('./config');

const twitterClient = new Twitter({
  consumer_key: config.ConsumerKey,
  consumer_secret: config.ConsumerSecret,
  access_token_key: config.AccessToken,
  access_token_secret: config.AccessTokenSecret
});

module.exports = (chatId, text) => {
  console.log(`Publishing tweet from chat ${chatId}`);

  return twitterClient.post('statuses/update', { status: text })
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
