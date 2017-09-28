'use strict';

const _ = require('lodash');
const respond = require('promise-to-respond');
const idParamRules = require('./id-param-rules');

/* eslint-disable no-unused-vars */
module.exports = {
  getCrudModel: () => { throw new Error('Must provide an implementation for getCrudModel'); },
  getReqParams: (req, res) => req.params,
  respond: respond(),
  validateRequest: (req, validationRules) => Promise.resolve(),
  create: {
    rules: {},
    getReqBody: (req, res) => req.body,
  },
  update: {
    rules: {},
    getReqBody: (req, res) => req.body,
  },
  find: {
    rules: {},
    getReqBody: (req, res) => req.body,
    getControls: data => _.merge({ skip: 0, limit: 20 }, _.pick(data, ['skip', 'limit'])),
    getControlsFrom: (req, res) => null,
    getConditions: body => null,
  },
  get: {
    rules: idParamRules('_id'),
  },
  remove: {
    rules: idParamRules('_id'),
  },
  reqParamId: '_id'
};
