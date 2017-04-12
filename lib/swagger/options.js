'use strict';

const getErrorResponses = require('./error-responses');
const errorDefinitions = require('./error-definitions');
const searchControlProperties = require('./search-control-properties');

module.exports = {
  entity: {
    name: 'please-specify-the-entity-name',
    path: null,
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
  getErrorResponses: getErrorResponses,
  errorDefinitions: errorDefinitions,
  searchProperties: searchControlProperties
};
