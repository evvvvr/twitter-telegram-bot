'use strict';

console.log('Loading function\n');

const Twitter = require('twitter');

const twitterClient = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

exports.handler = (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const text = event.Records[0].Sns.Message;

  if (!text) {
    return context.done(null, '');    
  }

  console.log(`Text is: ${text}\n`);

  return tweet(text)
    .then(() => {
      console.log(`Tweet published`);
      return context.done(null, '');
    })
    .catch((err) => {
      console.log(`Error publishing tweet: `);
      console.dir(err);
      return context.done(err, '');
    })
};

function tweet (status) {
  return twitterClient.post('statuses/update', { status });
}
