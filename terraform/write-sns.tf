resource "aws_sns_topic" "write" {
  name = "write"
}

resource "aws_sns_topic_subscription" "topic_write_lambda" {
  topic_arn = "${aws_sns_topic.write.arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.write.arn}"
}

resource "aws_lambda_permission" "with_write-sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.write.arn}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${aws_sns_topic.write.arn}"
}
