'use strict';

const _ = require('lodash');
const express = require('express');
const defaultOptions = require('./options');

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  const crud = opts.getCrudModel();

  const crudOp = (method, getData) => (req, res) => opts.respond(res, opts.validateRequest(req, opts[method].rules)
    .then(() => crud[method](getData(req, res))));

  const get = crudOp('get', opts.getReqParams);
  const remove = crudOp('remove', opts.getReqParams);
  const create = crudOp('create', opts.create.getReqBody);
  const update = crudOp('update', opts.update.getReqBody);

  const validateAndFind = (req, res) => opts.validateRequest(req, opts.find.rules).then(() => {
    const body = opts.find.getReqBody(req, res);
    const controls = opts.find.getControls(body);
    return crud.find(opts.find.getConditions(body))
      .skip(controls.skip)
      .limit(controls.limit)
      .exec();
  });

  const validateAndCount = (req, res) => opts.validateRequest(req, opts.find.rules)
    .then(() => crud.count(opts.find.getConditions(opts.find.getReqBody(req, res))).exec())
    .then(num => ({ count: num }));

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
  };
};
