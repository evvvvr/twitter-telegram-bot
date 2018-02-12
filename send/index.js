'use strict';

console.log('Loading function');

const send = require('./src/send');

module.exports.handler = (event, context) => {
  const message = event.Records[0].Sns.Message;

  if (!message) {
    return null;
  }

  const params = JSON.parse(message);

  return send(params.chatId, params.text)
    .then(() => context.done(null, null))
    .catch(err => context.done(err, null));
};
