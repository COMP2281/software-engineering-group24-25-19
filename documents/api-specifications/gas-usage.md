# HTTP method
`GET`

# Endpoint
TBC: `/gas-usage`?

# HTTP response status codes
| Status code | Description             |
| ----------- | ----------------------- |
| `200`       | OK                      |
| `401`       | Requires authentication |

# Description
Returns an array of gas usage data

# Response schema
```json
{
  "type": "array",
  "items": {
    "title": "Gas Usage Record",
    "description": "Gas usage record uniquely identified by site_id, start_year, and end_year.",
    "type": "object",
    "properties": {
      "site_id": {
        "type": "integer",
      },
      "start_year": {
        "type": "integer",
      },
      "end_year": {
        "type": "integer",
      },
      "energy_kwh": {
        "type": "integer",
      },
      "cost_gbp": {
        "type": "number",
      },
    },
    "required": [
      "site_id",
      "start_year",
      "end_year",
      "energy_kwh",
    ]
  }
}
```

# Example response
```json
[
  {
    "site_id": 1,
    "start_year": 2023,
    "end_year": 2024,
    "energy_kwh": 12345,
    "cost_gbp": 1234.56,
  },
  {
    "site_id": 2,
    "start_year": 2023,
    "end_year": 2024,
    "energy_kwh": 98765,
    "cost_gbp": 9876.54,
  },
  ...
]
```
