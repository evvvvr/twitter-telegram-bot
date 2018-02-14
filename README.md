Twitter bot for Telegram messenger
====

Publish, search and schedule tweets from Telegram.

Implemented with AWS Lambda/Node.js

## Usage
Add bot to Telegram and send commands. Users should authorize themselves with a password.

Commands are:
- `/tweet <text>`         - Tweet text. Media is not supported. Tweets longer than 280 characters
                            are not published.
- `/search <text>`        - Search for tweets from an account containing given text.
- `/password <password>`  - Authorize user with a password. **Send it only in private**.

## Build and Deploy

#### Prerequisites
- `terraform/variables.tfvars` file for Terraform and bot config parameters

TODO: Describe configuration

1. Run `npm run deploy` from project's root dir
2. This will output variable `webhook-url` containing URL of an AWS API Gateway endpoint  
  to be used as Telegram bot webhook URL.
4. To set-up webhook URL to be used (you need to do this once per URL):
  `curl -F "url=<webhook-url>" https://api.telegram.org/bot<bot-token>/setWebhook`
5. To clean-up previously set webhook with a different URL:
  `curl https://api.telegram.org/bot<bot-token>/setWebhook`

## Overall design