'use strict';

module.exports = {
  getKeyConditions: doc => { 
    return { _id: doc._id }; 
  },
  getDefaultValues: () => null,
  transformForSave: doc => doc
};