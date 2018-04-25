'use strict';

const moment = require('moment');
const db = require('./db');
const authorize = require('./authorization');
const executeCommand = require('./commands/executeCommand');
const sendPrivateMessage = require('./sendPrivateMessage');
const config = require('./config');

const KnownCommands = ['ping', 'authorize', 'tweet'];

module.exports = event => {
  const {message} = event;
  const messageTime = moment.unix(message.date);
  const sinceWhen = moment().subtract(config.SinceWhen, 'milliseconds');

  if (messageTime.isBefore(sinceWhen)) {
    return Promise.resolve();
  }

  const {chat: {id: chatId}, from: {id: userId}} = message;
  const {cmd, arg} = parseCommand(message) || {};

  if (cmd) {
    if (!KnownCommands.includes(cmd)) {
      return Promise.resolve();
    }

    console.log(`Received '${cmd}${arg ? ' ' + arg : ''}' command from user ${userId}`);
  }

  if (cmd === 'ping') { // no authorization required
    return executeCommand(cmd, arg, {chatId});
  }

  return db.getUserInfo(userId).then(userInfo => {
    if (!userInfo || !userInfo.authorized) {
      return authorize(userInfo, cmd, arg, message)
        .then(isAuthorized => {
          if (isAuthorized) {
            const {command: prevCmd, argument: prevArg} = userInfo;

            if (prevCmd) {
              return executeCommand(prevCmd, prevArg, {chatId});
            }
          }

          return Promise.resolve();
        });
    }

    // user authorized
    if (!cmd) {
      return Promise.resolve();
    }

    if (cmd === 'authorize') {
      return sendPrivateMessage(message, 'You are authorized already');
    }

    return executeCommand(cmd, arg, {chatId});
  });
};

function parseCommand (message) {
  if (message) {
    const CmdRegExp = /^\/(\w+)\s*([\s\S]*)/g;
    const cmdRegExpRes = CmdRegExp.exec(message.text);

    if (cmdRegExpRes) {
      return {
        cmd: cmdRegExpRes[1].toLowerCase(),
        arg: cmdRegExpRes[2]
      };
    }
  }

  return null;
}
