resource "aws_dynamodb_table" "users-dynamodb-table" {
  name           = "users"
  hash_key       = "id"
  read_capacity  = 5
  write_capacity = 5

  attribute {
    name = "id"
    type = "N"
  }
}
