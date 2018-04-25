'use strict';

const sendMessage = require('./sendMessage');

module.exports = (messageInfo, text) => {
  const chatId = messageInfo.chat.type !== 'private' ? messageInfo.from.id
    : messageInfo.chat.id;

  return sendMessage(chatId, text);
};
