'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware find operation', ()=> {

  const expectedError = 'Expected for testing';
  let req, res, options, crud, crudMiddlewareInstance;
  let skip, limit, exec;

  beforeEach(()=> {
    req = { body: {}, query: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    exec = sinon.stub().returns(Promise.resolve([]));
    limit = sinon.stub().returns({ exec });
    skip = sinon.stub().returns({ limit });
    crud = {
      find: sinon.stub().returns({ skip, exec })
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
      expect(options.find.getConditions.firstCall.args[0]).to.deep.equal(transformedRequestBody);
      done();
    });
  });

  it('should get the skip and limit search controls from the data provided by the getReqBody function', done => {
    const reqBody = { my: 'data', skip: 1, limit: 10 };
    options.find.getReqBody = () => reqBody;
    crudMiddlewareInstance = crudMiddleware(options);
    crudMiddlewareInstance.find(req, res).then(found => {
      expect(skip.firstCall.args[0]).to.equal(reqBody.skip);
      expect(limit.firstCall.args[0]).to.equal(reqBody.limit);
      done();
    });
  });

  it('should default skip to 0', done => {
    const reqBody = { my: 'data', limit: 10 };
    options.find.getReqBody = () => reqBody;
    crudMiddlewareInstance = crudMiddleware(options);
    crudMiddlewareInstance.find(req, res).then(found => {
      expect(skip.firstCall.args[0]).to.equal(0);
      expect(limit.firstCall.args[0]).to.equal(reqBody.limit);
      done();
    });
  });

  it('should default limit to 20', done => {
    const reqBody = { my: 'data', skip: 2 };
    options.find.getReqBody = () => reqBody;
    crudMiddlewareInstance = crudMiddleware(options);
    crudMiddlewareInstance.find(req, res).then(found => {
      expect(skip.firstCall.args[0]).to.equal(reqBody.skip);
      expect(limit.firstCall.args[0]).to.equal(20);
      done();
    });
  });

  it('should allow the skip and limit search controls to come from the querystring', done => {
    req.query = { skip: '1', limit: '10' };
    options.find.useControlsFromQuery = true;
    crudMiddlewareInstance = crudMiddleware(options);
    crudMiddlewareInstance.find(req, res).then(found => {
      expect(skip.firstCall.args[0]).to.equal(1);
      expect(limit.firstCall.args[0]).to.equal(10);
      done();
    });
  });

  it('should allow the skip and limit search controls to be omitted completely', done => {
    options.find.omitControls = true;
    crudMiddlewareInstance = crudMiddleware(options);
    crudMiddlewareInstance.find(req, res).then(found => {
      expect(skip.called).to.equal(false);
      expect(limit.called).to.equal(false);
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