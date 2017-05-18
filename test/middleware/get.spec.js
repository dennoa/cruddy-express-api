'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware get operation', ()=> {

  const expectedError = 'Expected for testing';
  let req, res, crud, options, crudMiddlewareInstance;

  beforeEach(()=> {
    req = { params: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    crud = {
      get: sinon.stub().returns(Promise.reject())
    };
    options = {
      getCrudModel: () => crud,
      validateRequest: sinon.stub().returns(Promise.resolve()),
      respond: (res, promise) => promise
    };
    crudMiddlewareInstance = crudMiddleware(options);
  });

  it('should get a model by _id', done => {
    const doc = { _id: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.get.returns(new Promise(resolve => resolve(doc)));
    req.params._id = doc._id;
    crudMiddlewareInstance.get(req, res).then(found => {
      expect(crud.get.firstCall.args[0]).to.deep.equal(req.params);
      expect(found).to.deep.equal(doc);
      done();
    });
  });

  it('should get the request parameters from the getReqParams function', done => {
    const transformedParams = { key: '123', other: '45' };
    options.getReqParams = () => transformedParams;
    crudMiddlewareInstance = crudMiddleware(options);
    crud.get.returns(new Promise(resolve => resolve()));
    crudMiddlewareInstance.get(req, res).then(() => {
      expect(crud.get.firstCall.args[0]).to.deep.equal(transformedParams);
      done();
    });
  });

  it('should run request validation using the get rules', done => {
    crud.get.returns(new Promise(resolve => resolve({})));
    req.params._id = '123';
    crudMiddlewareInstance.get(req, res).then(() => {
      expect(options.validateRequest.calledWith(req, crudMiddlewareInstance.options.get.rules)).to.equal(true);
      done();
    });
  });

  it('should update the validation rules to cater for a different reqParamId', () => {
    options.reqParamId = 'otherId';
    crudMiddlewareInstance = crudMiddleware(options);
    expect(crudMiddlewareInstance.options.get.rules).to.deep.equal({ otherId: { in: 'params', isMongoId: { errorMessage: 'invalid' } } });
  });

  it('should allow the validation rules to be overridden', () => {
    const custom = { thing: { myCustomValidator: { errorMessage: 'invalid' } } };
    options.get = { rules: Object.assign({}, custom) };
    crudMiddlewareInstance = crudMiddleware(options);
    expect(crudMiddlewareInstance.options.get.rules).to.deep.equal(custom);
  });

  it('should respond with any errors encountered when getting a model by _id', (done)=> {
    crud.get.returns(new Promise((resolve, reject)=> { reject(expectedError); }));
    req.params._id = 'some-key';
    crudMiddlewareInstance.get(req, res).catch(err => {
      expect(err).to.equal(expectedError);
      done();
    });
  });

});