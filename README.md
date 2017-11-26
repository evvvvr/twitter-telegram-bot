Twitter bot for Telegram messenger
====

Publish, search and schedule tweets from Telegram.

## Usage
Add bot to Telegram and send commands. Users will be asked for a password
on first interaction.

Commands are:
- `/tweet <text>`         - Tweet text. Media is not supported. Tweets longer than 280 characters
                            are not published.
- `/search <text>`        - Search for tweets from an account containing given text.
- `/password <password>`  - Authorize user with a password. **Send it only in private**.
                            There are different password for publishing/scheduling tweets and searching.
                            Publishing/scheduling password allows to search tweets.

## Setup

### Configuration
TODO: Describe configuration

0. TODO: Describe how to prepare Terraform to use S3 to store state
1. `cd bot && npm install`
2. `cd ../terraform && terraform apply  -var-file="variables.tfvars"`
3. This will output variable `webhook-url` containing URL of an AWS API Gateway endpoint  
  to be used as Telegram bot webhook URL.
4. Set-up webhook URL to be used:  
  `curl -F "url=<webhook-url>" https://api.telegram.org/bot<bot-token>/setWebhook`
5. To clean-up previously set webhook with a different URL:  
  `curl https://api.telegram.org/bot<bot-token>/setWebhook`

## Overall design