'use strict';

const _ = require('lodash');

const errors = {
  '400': {
    description: 'Validation errors',
    schema: { $ref: '#/definitions/validation-errors' }
  },
  '401': { description: 'Not authorized' },
  '404': { description: 'Not found' },
  '500': {
    description: 'System error',
    schema: { $ref: '#/definitions/system-error' }
  }
};

const noData = () => ({
  '204': {
    description: 'Success'
  }
});

const entityRef = opts => ({ $ref: `#/definitions/${opts.entityName}` });

const data = opts => ({
  '200': {
    description: (opts.arrayOf) ? `Array of ${opts.entityName}` : opts.entityName,
    schema: (opts.arrayOf) ? { type: 'array', items: entityRef(opts) } : entityRef(opts),
  }
});

function getResponses(opts) {
  return (opts.entityName) ? Object.assign(data(opts), errors) : Object.assign(noData(), errors);
}

module.exports = options => {
  const opts = options || {};
  const responses = getResponses(opts);
  return (opts.exclude) ? _.omit(responses, opts.exclude) : responses;
};
