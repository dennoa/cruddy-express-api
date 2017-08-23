'use strict';

class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = this.constructor.name;
    this.errors = errors;
  }

  toJSON() {
    return this.errors;
  }
}

module.exports = ValidationError;
