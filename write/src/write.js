'use strict';


const Twitter = require('twitter');
const config = require('./config');

const twitterClient = new Twitter({
  consumer_key: config.ConsumerKey,
  consumer_secret: config.ConsumerSecret,
  access_token_key: config.AccessToken,
  access_token_secret: config.AccessTokenSecret
});

module.exports = (event) => {
  const text = event.Records[0].Sns.Message;

  if (!text) {
    return null;
  }

  console.log(`Publishing tweet`);

  return tweet(text)
    .then(() => {
      console.log(`Tweet published`);
      return null;
    })
    .catch((err) => {
      console.log(`Error publishing tweet: `);
      console.dir(err);
      throw err;
    })
};

function tweet (status) {
  return twitterClient.post('statuses/update', { status });
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
