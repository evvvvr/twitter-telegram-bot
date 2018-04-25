'use strict';

console.log('Loading function');

const bot = require('./src/bot');

const OkResponse = {
  statusCode: 200
};

const ErrorResponse = {
  statusCode: 500
};

module.exports.handler = (event, context, callback) => {
  const update = JSON.parse(event.body);

  console.log('Received event:', JSON.stringify(update, null, 2));

  return bot(update)
    .then(() => callback(null, OkResponse))
    .catch(err => {
      console.log(`Error:`);
      console.dir(err);

      return callback(null, ErrorResponse);
    });
};
