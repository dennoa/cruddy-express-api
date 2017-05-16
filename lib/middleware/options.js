'use strict';

const respond = require('promise-to-respond');

module.exports = {
  getCrudModel: () => { throw new Error('Must provide an implementation for getCrudModel'); },
  getReqParams: req => req.params,
  respond: respond(),
  validateRequest: (req, validationRules) => Promise.resolve(),
  create: {
    rules: {},
    getReqBody: req => req.body,
  },
  update: {
    rules: {},
    getReqBody: req => req.body,
  },
  find: {
    rules: {},
    getReqBody: req => req.body,
    getControls: () => ({ skip: 0, limit: 20 }),
    getConditions: () => null
  },
  get: {
    rules: { _id: { in: 'params', isMongoId: { errorMessage: 'invalid' } } },
  },
  remove: {
    rules: { _id: { in: 'params', isMongoId: { errorMessage: 'invalid' } } },
  },
  reqParamId: '_id'
};
