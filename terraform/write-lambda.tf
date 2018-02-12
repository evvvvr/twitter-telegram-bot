data "archive_file" "write" {
  type        = "zip"
  source_dir  = "../write"
  output_path = "write.zip"
}

resource "aws_lambda_function" "write" {
  filename         = "${data.archive_file.write.output_path}"
  function_name    = "telegramTwitterBotWrite"
  role             = "${aws_iam_role.lambda-role.arn}"
  handler          = "index.handler"
  runtime          = "nodejs6.10"
  source_code_hash = "${base64sha256(file("${data.archive_file.write.output_path}"))}"
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
