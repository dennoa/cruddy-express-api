'use strict';

const respond = require('promise-to-respond');

module.exports = {
  getCrudModel: () => { throw new Error('Must provide an implementation for getCrudModel'); },
  respond: respond(),
  validateRequest: (req, validationRules) => Promise.resolve(),
  create: {
    rules: {}
  },
  update: {
    rules: {}
  },
  find: {
    rules: {},
    getControls: () => {
      return {
        skip: 0,
        limit: 20
      };
    },
    getConditions: () => null
  },
  reqParamId: '_id'
};