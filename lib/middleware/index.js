'use strict';

const _ = require('lodash');
const express = require('express');
const idParamRules = require('./id-param-rules');
const defaultOptions = require('./options');
const ValidationError = require('./ValidationError');

module.exports = options => {
  
  const opts = _.merge({}, defaultOptions, options);
  ['get', 'remove'].forEach(method => {
    opts[method].rules = (((options || {})[method] || {}).rules) ? options[method].rules : idParamRules(opts.reqParamId);
  });

  const crud = opts.getCrudModel();

  function getRules(req, res, rules) {
    return (typeof rules === 'function') ? Promise.resolve(rules(req, res)) : Promise.resolve(rules);
  }
  
  const validateRequest = (req, res, rules) => getRules(req, res, rules).then(rules => opts.validateRequest(req, rules));

  const crudOp = (method, getData) => (req, res) => opts.respond(res, validateRequest(req, res, opts[method].rules)
    .then(() => crud[method](getData(req, res))));

  const get = crudOp('get', opts.getReqParams);
  const remove = crudOp('remove', opts.getReqParams);
  const create = crudOp('create', opts.create.getReqBody);
  const update = crudOp('update', opts.update.getReqBody);

  const validateAndFind = (req, res) => validateRequest(req, res, opts.find.rules).then(() => {
    const body = opts.find.getReqBody(req, res);
    const controls = opts.find.getControls(opts.find.useControlsFromQuery ? req.query : body);
    return crud.find(opts.find.getConditions(body))
      .skip(controls.skip)
      .limit(controls.limit)
      .exec();
  });

  const validateAndCount = (req, res) => validateRequest(req, res, opts.find.rules)
    .then(() => crud.count(opts.find.getConditions(opts.find.getReqBody(req, res))).exec())
    .then(count => ({ count }));

  const find = (req, res) => opts.respond(res, validateAndFind(req, res));
  const count = (req, res) => opts.respond(res, validateAndCount(req, res));

  const routes = express.Router();
  routes.post('/', create);
  routes.put('/', update);
  routes.post('/find', find);
  routes.post('/count', count);
  routes.get(`/:${opts.reqParamId}`, get);
  routes.delete(`/:${opts.reqParamId}`, remove);

  return {
    options: opts,
    create,
    update,
    get,
    remove,
    find,
    count,
    routes,
    ValidationError,
  };
};
