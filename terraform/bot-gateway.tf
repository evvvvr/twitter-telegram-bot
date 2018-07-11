resource "aws_api_gateway_rest_api" "botWebhook" {
  name        = "TelegramTwitterBotWebhook"
  description = "Telegram Twitter Bot Webhook"
}

resource "aws_api_gateway_resource" "webhook" {
  rest_api_id = "${aws_api_gateway_rest_api.botWebhook.id}"
  parent_id   = "${aws_api_gateway_rest_api.botWebhook.root_resource_id}"
  path_part   = "webhook"
}

resource "aws_api_gateway_method" "postToWebhook" {
  rest_api_id   = "${aws_api_gateway_rest_api.botWebhook.id}"
  resource_id   = "${aws_api_gateway_resource.webhook.id}"
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "telegramTwitterBot_integration" {
  rest_api_id             = "${aws_api_gateway_rest_api.botWebhook.id}"
  resource_id             = "${aws_api_gateway_resource.webhook.id}"
  http_method             = "${aws_api_gateway_method.postToWebhook.http_method}"
  integration_http_method = "${aws_api_gateway_method.postToWebhook.http_method}"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${aws_lambda_function.inputHandler.function_name}/invocations"
  credentials             = "arn:aws:iam::${var.aws_account_id}:role/${aws_iam_role.lambda-role.name}"
}

resource "aws_api_gateway_deployment" "telegramTwitterBotHook_deploy" {
  depends_on  = ["aws_api_gateway_integration.telegramTwitterBot_integration"]
  stage_name  = "${var.api_env_stage_name}"
  rest_api_id = "${aws_api_gateway_rest_api.botWebhook.id}"
}

output "webhook-url" {
  value = "https://${aws_api_gateway_deployment.telegramTwitterBotHook_deploy.rest_api_id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_deployment.telegramTwitterBotHook_deploy.stage_name}/${aws_api_gateway_resource.webhook.path_part}"
}
