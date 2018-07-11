terraform {
  backend "s3" {}
}

data "terraform_remote_state" "state" {
  backend = "s3"

  config {
    bucket = "${var.state_bucket}"
    region = "${var.state_bucket_region}"
    key    = "${var.state_bucket_key}"
  }
}

provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "${var.aws_region}"
}
