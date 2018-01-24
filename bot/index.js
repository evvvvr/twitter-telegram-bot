'use strict';

console.log('Loading function');

const bot = require('./src/bot');

module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  return bot(event)
    .then(response => callback(null, response))
    .catch(err => callback(err));
};
