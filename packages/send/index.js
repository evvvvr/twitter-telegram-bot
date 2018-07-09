'use strict';

console.log('Loading function');

const send = require('./src/send');

module.exports.handler = (event, context, callback) => {
  const message = event.Records[0].Sns.Message;

  if (!message) {
    return callback();
  }

  const params = JSON.parse(message);

  return send(params.chatId, params.text)
    .then(() => callback())
    .catch(err => callback(err));
};
