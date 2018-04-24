'use strict';

console.log('Loading function');

const bot = require('./src/bot');

const OkResponse = {
  statusCode: 200
};

module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  return bot(event)
    .then(() => callback(null, OkResponse))
    .catch(err => {
      console.log(`Error:`);
      console.dir(err);

      return callback(err);
    });
};
