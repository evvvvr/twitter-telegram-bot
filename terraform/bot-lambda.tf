data "archive_file" "bot" {
  type        = "zip"
  source_dir  = "../bot"
  output_path = "bot.zip"
}

resource "aws_lambda_function" "inputHandler" {
  filename         = "${data.archive_file.bot.output_path}"
  function_name    = "telegramTwitterBotInput"
  role             = "${aws_iam_role.lambda-role.arn}"
  handler          = "index.handler"
  runtime          = "nodejs6.10"
  source_code_hash = "${base64sha256(file("${data.archive_file.bot.output_path}"))}"
  publish          = true

  environment {
    variables = {
      BOT_TOKEN     = "${var.bot_token}"
      SINCE_WHEN    = "${var.since_when}"
      WRITE_SNS_ARN = "${aws_sns_topic.write.arn}"
    }
  }
}
