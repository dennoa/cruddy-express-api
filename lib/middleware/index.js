'use strict';

const _ = require('lodash');
const express = require('express');
const defaultOptions = require('./options');

module.exports = options => {

  let opts = _.merge({}, defaultOptions, options);
  let crud = opts.getCrudModel();

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

  function crudFind(req, res) {
    return opts.respond(res, find(req));
  }

  let create = crudSave('create');
  let update = crudSave('update');

  let router = express.Router();
  router.post('/', create);
  router.put('/', update);
  router.post('/find', crudFind);
  router.get('/:key', get);
  router.delete('/:key', remove);

  return {
    options: opts,
    create: create,
    update: update,
    get: get,
    remove: remove,
    find: crudFind,
    routes: router
  };
};