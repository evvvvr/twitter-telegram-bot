data "external" "bot_zip" {
  program = ["./zip.sh", "../dist/bot.zip", "../packages/bot"]
}

resource "aws_lambda_function" "inputHandler" {
  filename         = "../dist/bot.zip"
  function_name    = "telegramTwitterBotInput"
  role             = "${aws_iam_role.lambda-role.arn}"
  handler          = "index.handler"
  runtime          = "nodejs6.10"
  source_code_hash = "${data.external.bot_zip.result.hash}"
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
