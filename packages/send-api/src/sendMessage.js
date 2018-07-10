'use strict';

const AWS = require('aws-sdk');
const config = require('./config');

const sns = new AWS.SNS();

module.exports = (chatId, text) => {
  const payload = JSON.stringify({chatId, text});
  const params = {
    Message: JSON.stringify({default: payload}),
    MessageStructure: 'json',
    TopicArn: config.SendSnsARN
  };

  console.log(`send message api\n`);
  return sns.publish(params).promise()
    .catch(err => {
      console.log(`Error sending message: ${err}`);
      throw err;
    });
};
