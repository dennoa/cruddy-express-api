'use strict';

const _ = require('lodash');
const express = require('express');
const defaultOptions = require('./options');

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  const crud = opts.getCrudModel();

  const get = (req, res) => opts.respond(res, crud.get(opts.getReqParams(req, res)));

  const remove = (req, res) => opts.respond(res, crud.remove(opts.getReqParams(req, res)));

  function crudSave(createOrUpdate) {
    const save = (req, res) => opts.validateRequest(req, opts[createOrUpdate].rules)
      .then(() => crud[createOrUpdate](opts[createOrUpdate].getReqBody(req, res)));
    return (req, res) => opts.respond(res, save(req, res));
  }

  const find = (req, res) => opts.validateRequest(req, opts.find.rules).then(() => {
    const body = opts.find.getReqBody(req, res);
    const controls = opts.find.getControls(body);
    return crud.find(opts.find.getConditions(body))
      .skip(controls.skip)
      .limit(controls.limit)
      .exec();
  });

  const count = (req, res) => opts.validateRequest(req, opts.find.rules)
    .then(() => crud.count(opts.find.getConditions(opts.find.getReqBody(req, res))).exec())
    .then(num => ({ count: num }));

  const crudFind = (req, res) => opts.respond(res, find(req, res));
  const crudCount = (req, res) => opts.respond(res, count(req, res));

  const create = crudSave('create');
  const update = crudSave('update');

  const routes = express.Router();
  routes.post('/', create);
  routes.put('/', update);
  routes.post('/find', crudFind);
  routes.post('/count', crudCount);
  routes.get('/:' + opts.reqParamId, get);
  routes.delete('/:' + opts.reqParamId, remove);

  return {
    options: opts,
    create,
    update,
    get,
    remove,
    find: crudFind,
    count: crudCount,
    routes,
  };
};
