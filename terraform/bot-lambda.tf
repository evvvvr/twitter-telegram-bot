data "archive_file" "bot" {
  type        = "zip"
  source_dir  = "../packages/bot"
  output_path = "../dist/bot.zip"
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
      SINCE_WHEN    = "${var.since_when}"
      WRITE_SNS_ARN = "${aws_sns_topic.tweet.arn}"
      SEND_SNS_ARN  = "${aws_sns_topic.send.arn}"
      PASSWORD_HASH = "${var.password_hash}"
    }
  }
}
