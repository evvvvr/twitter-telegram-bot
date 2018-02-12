'use strict';

const fetch = require('node-fetch');
const config = require('./config');

module.exports = (chatId, text) => {
  console.log(`Sending message`);

  return send(chatId, text)
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }

      console.log(`Message sent`);
      return null;
    })
    .catch(err => {
      console.log(`Error sending message: `);
      console.dir(err);
      throw err;
    });
};

function send (chatId, message) {
  const url = `https://api.telegram.org/bot${config.BotToken}/sendMessage`;

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
