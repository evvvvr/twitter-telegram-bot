'use strict';

console.log('Loading function');

const send = require('./src/send');

module.exports.handler = (event, context) => {
  return send(event)
    .then(() => context.done(null, null))
    .catch(err => context.done(err, null));
};
