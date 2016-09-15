'use strict';

const _ = require('lodash');

const errorResponses = {
  "400": {
    "description": "Validation errors",
    "schema": {
      "$ref": "#/definitions/validation-errors"
    }
  },
  "401": {
    "description": "Not authorized"
  },
  "404": {
    "description": "Not found"
  },
  "500": {
    "description": "System error",
    "schema": {
      "$ref": "#/definitions/system-error"
    }
  }
};

module.exports = options => {
  if (options && options.exclude) {
    return _.omit(errorResponses, options.exclude);
  }
  return errorResponses;
};