'useStrict';

const sendMessage = require('../sendMessage');
const tweet = require('./tweet');

module.exports = (cmd, arg, {chatId}) => {
  console.log(`Executing '${cmd}${arg ? ' ' + arg : ''}' command`);

  switch (cmd) {
    case 'ping':
      return sendMessage(chatId, 'pong');

    case 'tweet':
      return tweet(chatId, arg);
  }

  throw new Error('unknown command');
};
