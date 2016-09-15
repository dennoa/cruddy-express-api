'use strict';

const errorResponses = require('./error-responses');
const errorDefinitions = require('./error-definitions');
const searchControlProperties = require('./search-control-properties');

module.exports = {
  entity: {
    name: 'please-specify-the-entity-name',
    schema: {
      type: 'object',
      properties: {} 
    }
  },
  pathPrefix: { read: '', write: '' },
  tag: {
    read: { name: null, description: null },
    write: { name: null, description: null }
  },
  reqParamId: '_id',
  errorResponses: errorResponses,
  errorDefinitions: errorDefinitions,
  searchProperties: searchControlProperties
};
