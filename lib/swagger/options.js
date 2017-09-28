'use strict';

const getErrorResponses = require('./error-responses');
const getResponses = require('./responses');
const errorDefinitions = require('./error-definitions');
const searchProperties = require('./search-control-properties');

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
  getErrorResponses,
  getResponses,
  errorDefinitions,
  searchProperties,
  useControlsFromQuery: false,
};
