'use strict';

console.log('Loading function');

const tweet = require('./src/tweet');

module.exports.handler = (event, context) => {
  const message = event.Records[0].Sns.Message;

  if (!message) {
    return null;
  }

  const params = JSON.parse(message);

  return tweet(params.chatId, params.tweet)
    .then(() => context.done(null, null))
    .catch(err => context.done(err, null));
};
