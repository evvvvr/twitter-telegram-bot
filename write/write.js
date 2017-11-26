'use strict';

console.log('Loading function\n');

exports.handler = (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const text = event.Records[0].Sns.Message;

  if (!text) {
    return context.done(null, '');    
  }

  console.log(`Text is: ${text}\n`);

  return context.done(null, '');
};
