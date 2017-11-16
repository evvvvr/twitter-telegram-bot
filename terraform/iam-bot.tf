resource "aws_iam_role" "lambda-role" {
  name               = "lambda_role"
  assume_role_policy = "${file("policies/lambda-role.json")}"
}

resource "aws_iam_role_policy" "lambda_policy" {
  name   = "lambda_policy"
  role   = "${aws_iam_role.lambda-role.id}"
  policy = "${file("policies/lambda-policy.json")}"
}
