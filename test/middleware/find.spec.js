'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware find operation', ()=> {

  const expectedError = 'Expected for testing';
  let req, res, options, crud, crudMiddlewareInstance;
  let skip, limit, exec;

  beforeEach(()=> {
    req = { body: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    exec = sinon.stub().returns(Promise.resolve([]));
    limit = sinon.stub().returns({ exec: exec });
    skip = sinon.stub().returns({ limit: limit });
    crud = {
      find: sinon.stub().returns({ skip : skip })
    };
    options = {
      getCrudModel: () => crud,
      validateRequest: sinon.stub().returns(Promise.resolve()),
      respond: (res, promise) => promise,
      find: {},
    };
    crudMiddlewareInstance = crudMiddleware(options);
  });

  it('should find models', done => {
    const docs = [{ key: '234', dateFrom: '2016-09-06T07:25:10.759Z' }, { key: 'abc', dateFrom: '2016-10-06T07:25:10.759Z' }];
    exec.returns(Promise.resolve(docs));
    crudMiddlewareInstance.find(req, res).then(found => {
      expect(found).to.deep.equal(docs);
      done();
    });
  });

  it('should run request validation when finding models', done => {
    crudMiddlewareInstance.find(req, res).then(found => {
      expect(options.validateRequest.calledWith(req, crudMiddlewareInstance.options.find.rules)).to.equal(true);
      done();
    });
  });

  it('should get the data for the find operation from the getReqBody function', done => {
    const transformedRequestBody = { my: 'data' };
    options.find.getReqBody = () => transformedRequestBody;
    options.find.getConditions = sinon.stub();
    crudMiddlewareInstance = crudMiddleware(options);
    crudMiddlewareInstance.find(req, res).then(found => {
      console.log(options.find.getConditions.firstCall.args[0]);
      expect(options.find.getConditions.firstCall.args[0]).to.deep.equal(transformedRequestBody);
      done();
    });
  });

  it('should respond with any unexpected error encountered when finding models', done => {
    exec.returns(Promise.reject(expectedError));
    crudMiddlewareInstance.find(req, res).catch(err => {
      expect(err).to.deep.equal(expectedError);
      done();
    });
  });

});