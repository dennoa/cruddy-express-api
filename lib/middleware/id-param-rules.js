'use strict';

module.exports = reqParamId => {
  const rules = {};
  rules[reqParamId] = { in: 'params', isMongoId: { errorMessage: 'invalid' } };
  return rules;
};
