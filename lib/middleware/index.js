'use strict';

const _ = require('lodash');
const express = require('express');
const defaultOptions = require('./options');

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  const crud = opts.getCrudModel();

  function get(req, res) {
    return opts.respond(res, crud.get(req.params));
  }

  function remove(req, res) {
    return opts.respond(res, crud.remove(req.params));
  }

  function crudSave(createOrUpdate) {

    function save(req) {
      return new Promise((resolve, reject)=> {
        opts.validateRequest(req, opts[createOrUpdate].rules).then(() => {
          crud[createOrUpdate](req.body).then(resolve, reject);
        }, reject);
      });
    }

    return (req, res) => {
      return opts.respond(res, save(req));
    };
  }

  function find(req) {
    return new Promise((resolve, reject)=> {
      opts.validateRequest(req, opts.find.rules).then(() => {
        let controls = opts.find.getControls(req.body);
        crud.find(opts.find.getConditions(req.body))
          .skip(controls.skip)
          .limit(controls.limit)
          .exec()
          .then(resolve, reject);
      }, reject);
    });
  }

  function count(req) {
    return new Promise((resolve, reject)=> {
      opts.validateRequest(req, opts.find.rules).then(() => {
        crud.count(opts.find.getConditions(req.body))
          .exec()
          .then(num => resolve({ count: num }), reject);
      }, reject);
    });
  }

  const crudFind = (req, res) => opts.respond(res, find(req));
  const crudCount = (req, res) => opts.respond(res, count(req));

  const create = crudSave('create');
  const update = crudSave('update');

  const router = express.Router();
  router.post('/', create);
  router.put('/', update);
  router.post('/find', crudFind);
  router.post('/count', crudCount);
  router.get('/:' + opts.reqParamId, get);
  router.delete('/:' + opts.reqParamId, remove);

  return {
    options: opts,
    create: create,
    update: update,
    get: get,
    remove: remove,
    find: crudFind,
    count: crudCount,
    routes: router
  };
};