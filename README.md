Twitter bot for Telegram messenger
====

Send tweets from Telegram.

Bot implemented via Telegram webhook set-up using AWS API Gateway endpoint
invoking AWS Lambda function and using AWS SNS and AWS Lambda to send
messages/publish tweets etc.

## Set-up
1. Clone this repo
2. Add `terraform/variables.tfvars` file (see [Config](#config) section)
3. `cd <project root dir> && npm run terraform-init` to init Terraform 
4. `cd <project root dir> && npm run deploy` 
5. Previous step will output variable `webhook-url` containing URL of an AWS API Gateway endpoint  
   to be used as Telegram bot webhook URL.
6. Set-up webhook URL to be used (you need to do this once per URL):
  `curl -F "url=<webhook-url>" https://api.telegram.org/bot<bot-token>/setWebhook`
7. To remove previously set webhook:
  `curl https://api.telegram.org/bot<bot-token>/setWebhook`

### Config
- `aws_account_id`        - AWS IAM account id to deploy bot
- `aws_access_key`        - AWS IAM account access key to deploy bot
- `aws_secret_key`        - AWS IAM account secret key to deploy bot
- `state_bucket`          - AWS S3 bucket name where to store Terraform state
- `state_bucket_key`      - AWS S3 key for a Terraform state
- `state_bucket_region`   - AWS region where S3 bucket with Terraform state is stored
                            (default: 'eu-central-1')
- `aws_region`            - AWS region in which to deploy bot (default: 'eu-central-1')
- `api_env_stage_name`    - AWS API gateway stage name for bot's webhook deployment

- `bot_token`             - Telegram bot token
- `since_when`            - Bot will not react to messages older than this amount of time
                          (milliseconds)                       
- `password_hash`         - bcrypt hash of bot's password

- `consumer_key`          - Twitter API consumer key
- `consumer_secret`       - Twitter API consumer secret
- `access_token`          - Twitter API access token
- `access_token_secret`   - Twitter API access token secret

## Usage
Add bot to Telegram and send the commands. Commands are:
- `/ping`         - Health-check to which bot simply responds with a 'pong' message.
- `/tweet <text>` - Tweets text. Media is not supported. Tweets longer than 280 characters
                    are not published. Authorization required.
- `/authorize`    - Starts authorization for a user. Bot will ask for a password
                    and check if it matches password from config. Sending any command
                    requiring authorization if user is not authorized will start
                    authorization.