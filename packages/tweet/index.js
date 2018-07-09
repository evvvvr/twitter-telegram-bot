'use strict';

console.log('Loading function');

const tweet = require('./src/tweet');

module.exports.handler = (event, context, callback) => {
  const message = event.Records[0].Sns.Message;

  if (!message) {
    return callback();
  }

  const params = JSON.parse(message);

  return tweet(params.chatId, params.tweet)
    .then(() => callback())
    .catch(err => callback(err));
};
