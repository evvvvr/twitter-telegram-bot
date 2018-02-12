'use strict';

console.log('Loading function');

const write = require('./src/write');

module.exports.handler = (event, context) => {
  const message = event.Records[0].Sns.Message;

  if (!message) {
    return null;
  }

  const params = JSON.parse(message);

  return write(params.chatId, params.tweet)
    .then(() => context.done(null, null))
    .catch(err => context.done(err, null));
};
