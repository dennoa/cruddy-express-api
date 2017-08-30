'use strict';

const _ = require('lodash');
const responses = require('./responses');

module.exports = options => _.omit(responses(options), ['200', '204']);
