# HTTP method
`GET`

# Endpoint
`/users`

# HTTP response status codes
| Status code | Description             |
| ----------- | ----------------------- |
| `200`       | OK                      |
| `401`       | Requires authentication |

# Description
Returns a list of users

# Response schema
```json
{
  "type": "array",
  "items": {
    "title": "Simple User",
    "description": "A GitHub user.",
    "type": "object",
    "properties": {
      "name": {
        "type": [
          "string",
          "null"
        ]
      },
      "email": {
        "type": [
          "string",
          "null"
        ]
      },
      "login": {
        "type": "string",
        "examples": [
          "octocat"
        ]
      },
      "id": {
        "type": "integer",
        "format": "int64",
        "examples": [
          1
        ]
      },
      "avatar_url": {
        "type": "string",
        "format": "uri",
        "examples": [
          "https://github.com/images/error/octocat_happy.gif"
        ]
      },
      "url": {
        "type": "string",
        "format": "uri",
        "examples": [
          "https://api.github.com/users/octocat"
        ]
      }
    },
    "required": [
      "avatar_url",
      "id",
      "login",
      "type",
      "url"
    ]
  }
}
```

# Example response
```json
[
  {
    "login": "octocat",
    "id": 1,
    "avatar_url": "https://github.com/images/error/octocat_happy.gif",
    "url": "https://api.github.com/users/octocat",
    "type": "User"
  }
]
```
