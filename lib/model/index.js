'use strict';

const _ = require('lodash');
const defaultOptions = require('./options');

function toPromise(func, args) {
  let result = func(args);
  return (result instanceof Promise) ? result : Promise.resolve(result);
}

function replaceArrays(target, source) {
  if (target instanceof Array) { return source; }
}

const promiseToSave = doc => new Promise((resolve, reject) => doc.save(err => {
  if (err) { return reject(err); }
  resolve(doc);
}));

const promiseToRemove = doc => new Promise((resolve, reject) => doc.remove(err => {
  if (err) { return reject(err); }
  resolve();
}));

module.exports = options => {

  let opts = _.merge({}, defaultOptions, options);

  const create = doc => Promise.all([toPromise(opts.getDefaultValues), toPromise(opts.transformForSave, doc)])
    .then(values => opts.model.create(_.merge({}, values[0], values[1])));

  function get(keyConditions) {
    return new Promise((resolve, reject) => {
      opts.model.findOne(keyConditions).exec().then(existing => {
        if (!existing) { return reject(); }
        resolve(existing);
      }, reject);
    });
  }

  const update = doc => Promise.all([get(opts.getKeyConditions(doc)), toPromise(opts.transformForSave, doc)])
    .then(values => promiseToSave(_.mergeWith(values[0], values[1], replaceArrays)));

  const remove = keyConditions => get(keyConditions).then(promiseToRemove);

  const find = conditions => opts.model.find(conditions);

  const count = conditions => opts.model.count(conditions);

  return {
    options: opts,
    create: create,
    update: update,
    get: get,
    remove: remove,
    find: find,
    count: count
  };
};
