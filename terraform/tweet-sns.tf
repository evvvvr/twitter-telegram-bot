resource "aws_sns_topic" "tweet" {
  name = "tweet"
}

resource "aws_sns_topic_subscription" "topic_tweet_lambda" {
  topic_arn = "${aws_sns_topic.tweet.arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.tweet.arn}"
}

resource "aws_lambda_permission" "with_tweet-sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.tweet.arn}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${aws_sns_topic.tweet.arn}"
}
