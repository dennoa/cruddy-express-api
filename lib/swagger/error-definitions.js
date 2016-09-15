'use strict';

module.exports = {
  "validation-error": {
    "type": "object",
    "description": "Validation error",
    "properties": {
      "param": {
        "type": "string",
        "description": "The parameter in error"
      },
      "msg": {
        "type": "string",
        "enum": ["invalid", "required", "unavailable"],
        "description": "The error code"
      }
    }
  },
  "validation-errors": {
    "type": "array",
    "description": "Validation errors",
    "items": {
      "$ref": "#/definitions/validation-error"
    }
  },
  "system-error": {
    "type": "object",
    "description": "System error",
    "properties": {
      "error": {
        "type": "string",
        "description": "The error message"
      }
    }
  }
};