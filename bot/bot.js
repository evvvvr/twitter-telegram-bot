'use strict';

console.log('Loading function\n');

const fetch = require('node-fetch');
const moment = require('moment');

// config
const BotToken = process.env.BOT_TOKEN;
const SinceWhen = process.env.SINCE_WHEN;

const response = {
  statusCode: 200
};

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const message = event.message;
    if (message) {
      const messageTime = moment.unix(message.date);
      const sinceWhen = moment().subtract(SinceWhen, 'milliseconds');

      if (messageTime.isSameOrAfter(sinceWhen)) {
        if (message.text.toLowerCase() === '/ping') {
          sendMessage(message.chat.id, 'pong')
            .then(res => {
              if (!res.ok) {
                throw Error(res.statusText);
              }

              console.log('Message posted')
              return callback(null, response);
            })
            .catch(err => {
              console.log(`Error: ${err}`);
              return callback(err);
            });
        }
      }
    }

    return callback(null, response);
};

function sendMessage (chatId, message) {
  const url = `https://api.telegram.org/bot${BotToken}/sendMessage`;

  return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
  });
}
