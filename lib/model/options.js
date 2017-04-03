'use strict';

module.exports = {
  getKeyConditions: doc => ({ _id: doc._id }),
  getDefaultValues: () => null,
  transformForSave: doc => doc
};