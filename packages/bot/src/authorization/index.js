'use strict';

const bcrypt = require('bcryptjs');
const db = require('./db');
const sendPrivateMessage = require('../sendPrivateMessage');
const ConversationPhase = require('../conversationPhase');
const config = require('../config');

module.exports = (userInfo, cmd, arg, messageInfo) => {
  const {from: {id: userId}, text: messageText} = messageInfo;

  if (!userInfo) {
    if (!cmd) {
      return Promise.resolve(false);
    }

    console.log(`No user info for user ${userId}`);

    return startAuthorization(userId, cmd, arg, messageInfo)
      .then(() => { return false; });
  }

  const {authorized, conversationPhase, command: prevCmd, argument: prevArg} =
    userInfo;

  if (authorized) {
    throw new Error('user should be not authorized');
  }

  if (conversationPhase !== ConversationPhase.AUTHORIZATION) {
    if (!cmd) {
      return Promise.resolve(false);
    }

    return startAuthorization(userId, cmd, arg, messageInfo)
      .then(() => { return false; });
  }

  if (messageInfo.chat.type !== 'private') {
    return sendPrivateMessage(messageInfo, 'Please, send password via private message only')
      .then(() => { return false; });
  }

  const passwordsMatch = bcrypt.compareSync(messageText, config.PasswordHash);

  if (!passwordsMatch) {
    console.log(`Failed authorization attempt for user ${userId}`);

    return failAuthorization(userId, messageInfo)
      .then(() => { return false; });
  }

  console.log(`User ${userId} successfully authorized`);

  return succeedAuthorization(userId, prevCmd, prevArg, messageInfo)
    .then(() => { return true; });
};

function startAuthorization (userId, cmd, arg, messageInfo) {
  return db.saveAuthorizationStarted(userId, cmd, arg)
    .then(() => sendPrivateMessage(messageInfo, 'Enter password'));
}

function failAuthorization (userId, messageInfo) {
  return db.saveAuthorizationFailed(userId)
    .then(() => sendPrivateMessage(messageInfo, 'Invalid password'));
}

function succeedAuthorization (userId, prevCmd, prevArg, messageInfo) {
  return db.saveAuthorizationSucceeded(userId)
    .then(() => sendPrivateMessage(messageInfo, 'You are authorized'));
}
