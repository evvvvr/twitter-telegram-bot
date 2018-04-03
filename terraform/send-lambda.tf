data "archive_file" "send" {
  type        = "zip"
  source_dir  = "../send"
  output_path = "../dist/send.zip"
}

resource "aws_lambda_function" "send" {
  filename         = "${data.archive_file.send.output_path}"
  function_name    = "telegramTwitterBotSend"
  role             = "${aws_iam_role.lambda-role.arn}"
  handler          = "index.handler"
  runtime          = "nodejs6.10"
  source_code_hash = "${base64sha256(file("${data.archive_file.send.output_path}"))}"
  publish          = true

  environment {
    variables = {
      BOT_TOKEN = "${var.bot_token}"
    }
  }
}
