'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware count operation', ()=> {

  const expectedError = 'Expected for testing';
  let req, res, options, crud, crudMiddlewareInstance;
  let exec;

  beforeEach(()=> {
    req = { body: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    exec = sinon.stub().returns(Promise.resolve(0));
    crud = {
      count: sinon.stub().returns({ exec : exec })
    };
    options = {
      getCrudModel: () => crud,
      validateRequest: sinon.stub().returns(Promise.resolve()),
      respond: (res, promise) => promise
    };
    crudMiddlewareInstance = crudMiddleware(options);
  });

  it('should count models', done => {
    exec.returns(Promise.resolve(3));
    crudMiddlewareInstance.count(req, res).then(result => {
      expect(result.count).to.equal(3);
      done();
    });
  });

  it('should run find request validation when counting models', done => {
    crudMiddlewareInstance.count(req, res).then(found => {
      expect(options.validateRequest.calledWith(req, crudMiddlewareInstance.options.find.rules)).to.equal(true);
      done();
    });
  });

  it('should respond with any unexpected error encountered when counting models', done => {
    exec.returns(Promise.reject(expectedError));
    crudMiddlewareInstance.count(req, res).catch(err => {
      expect(err).to.deep.equal(expectedError);
      done();
    });
  });

});