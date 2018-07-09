data "archive_file" "tweet" {
  type        = "zip"
  source_dir  = "../packages/tweet"
  output_path = "../dist/tweet.zip"
}

resource "aws_lambda_function" "tweet" {
  filename         = "${data.archive_file.tweet.output_path}"
  function_name    = "telegramTwitterBotTweet"
  role             = "${aws_iam_role.lambda-role.arn}"
  handler          = "index.handler"
  runtime          = "nodejs6.10"
  source_code_hash = "${base64sha256(file("${data.archive_file.tweet.output_path}"))}"
  publish          = true

  environment {
    variables = {
      BOT_TOKEN           = "${var.bot_token}"
      CONSUMER_KEY        = "${var.consumer_key}"
      CONSUMER_SECRET     = "${var.consumer_secret}"
      ACCESS_TOKEN        = "${var.access_token}"
      ACCESS_TOKEN_SECRET = "${var.access_token_secret}"
      SEND_SNS_ARN        = "${aws_sns_topic.send.arn}"
    }
  }
}
