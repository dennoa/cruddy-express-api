'use strict';

module.exports = {
  getKeyConditions: doc => { 
    return { key: doc.key }; 
  },
  getDefaultValues: () => null
};