'use strict';

const bcrypt = require('bcryptjs');
const db = require('./db');
const sendMessage = require('../sendMessage');
const ConversationPhase = require('../conversationPhase');
const config = require('../config');

module.exports = (userInfo, cmd, arg, {userId, chatId, messageText}) => {
  if (!userInfo) {
    if (!cmd) {
      return Promise.resolve(false);
    }

    console.log(`No user info for user ${userId}`);

    return startAuthorization(userId, cmd, arg, chatId)
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

    return startAuthorization(userId, cmd, arg, chatId)
      .then(() => { return false; });
  }

  const passwordsMatch = bcrypt.compareSync(messageText, config.PasswordHash);

  if (!passwordsMatch) {
    console.log(`Failed authorization attempt for user ${userId}`);

    return failAuthorization(userId, chatId)
      .then(() => { return false; });
  }

  console.log(`User ${userId} successfully authorized`);

  return succeedAuthorization(userId, prevCmd, prevArg, chatId)
    .then(() => { return true; });
};

function startAuthorization (userId, cmd, arg, chatId) {
  return db.saveAuthorizationStarted(userId, cmd, arg)
    .then(() => sendMessage(chatId, 'Enter password'));
}

function failAuthorization (userId, chatId) {
  return db.saveAuthorizationFailed(userId)
    .then(() => sendMessage(chatId, 'Invalid password'));
}

function succeedAuthorization (userId, prevCmd, prevArg, chatId) {
  return db.saveAuthorizationSucceeded(userId)
    .then(() => sendMessage(chatId, 'You are authorized'));
}

