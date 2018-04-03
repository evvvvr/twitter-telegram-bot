resource "aws_dynamodb_table" "authorizedUsers-dynamodb-table" {
  name           = "authorizedUsers"
  hash_key       = "userId"
  read_capacity  = 5
  write_capacity = 5

  attribute {
    name = "userId"
    type = "N"
  }
}
