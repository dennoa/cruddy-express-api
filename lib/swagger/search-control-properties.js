'use strict';

module.exports = {
  skip: {
    type: 'integer',
    format: 'int32',
    minimum: 0,
    maximum: 500,
    default: 0,
    description: 'The number of results to skip before returning matches. Use this to support paging. Maximum of 500'
  },
  limit: {
    type: 'integer',
    format: 'int32',
    minimum: 1,
    maximum: 200,
    default: 20,
    description: 'Limit the number of results returned. Defaults to 20. Maximum of 200'
  }
};
