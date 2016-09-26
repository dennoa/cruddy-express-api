'use strict';

const _ = require('lodash');
const defaultOptions = require('./options');

module.exports = options => {

  let opts = _.merge({}, defaultOptions, options);

  function create(doc) {
    return opts.model.create(_.merge({}, opts.getDefaultValues(), opts.transformForSave(doc)));
  }

  function get(keyConditions) {
    return new Promise((resolve, reject) => {
      opts.model.findOne(keyConditions).exec().then(existing => {
        if (!existing) { return reject(); }
        resolve(existing);
      }, reject);
    });
  }

  function replaceArrays(target, source) {
    if (target instanceof Array) { return source; }
  }

  function update(doc) {
    return new Promise((resolve, reject) => {
      get(opts.getKeyConditions(doc)).then(existing => {
        _.mergeWith(existing, opts.transformForSave(doc), replaceArrays).save(err => {
          if (err) { return reject(err); }
          resolve(existing);
        });
      }, reject);
    });
  }

  function remove(keyConditions) {
    return new Promise((resolve, reject) => {
      get(keyConditions).then(existing => {
        existing.remove(err => {
          if (err) { return reject(err); }
          resolve();
        });
      }, reject);
    });
  }

  function find(conditions) {
    return opts.model.find(conditions);
  }

  return {
    options: opts,
    create: create,
    update: update,
    get: get,
    remove: remove,
    find: find
  };
};
