resource "aws_sns_topic" "send" {
  name = "send"
}

resource "aws_sns_topic_subscription" "topic_send_lambda" {
  topic_arn = "${aws_sns_topic.send.arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.send.arn}"
}

resource "aws_lambda_permission" "with_send-sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.send.arn}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${aws_sns_topic.send.arn}"
}
