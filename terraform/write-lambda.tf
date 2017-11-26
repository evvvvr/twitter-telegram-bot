data "archive_file" "write" {
  type        = "zip"
  source_dir  = "../write"
  output_path = "write.zip"
}

resource "aws_lambda_function" "write" {
  filename         = "${data.archive_file.write.output_path}"
  function_name    = "telegramTwitterBotWrite"
  role             = "${aws_iam_role.lambda-role.arn}"
  handler          = "write.handler"
  runtime          = "nodejs6.10"
  source_code_hash = "${base64sha256(file("${data.archive_file.write.output_path}"))}"
  publish          = true
}
