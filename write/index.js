'use strict';

console.log('Loading function');

const write = require('./src/write');

exports.handler = (event, context) => {
  return write(event)
    .then(() => context.done(null, null))
    .catch(err => context.done(err, null));
};
