'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware remove operation', ()=> {

  let expectedError = 'Expected for testing';
  let req, res, crud, options, crudMiddlewareInstance;

  beforeEach(()=> {
    req = { params: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    crud = {
      remove: sinon.stub().returns(new Promise((resolve, reject) => reject()))
    };
    options = {
      getCrudModel: () => crud,
      respond: (res, promise) => promise
    };
    crudMiddlewareInstance = crudMiddleware(options);
  });

  it('should remove a model by key', done => {
    let doc = { key: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.remove.returns(new Promise(resolve => resolve()));
    req.params.key = doc.key;
    crudMiddlewareInstance.remove(req, res).then(() => {
      expect(crud.remove.firstCall.args[0]).to.deep.equal(req.params);
      done();
    });
  });

  it('should get the request parameters from the getReqParams function', done => {
    const transformedParams = { key: '123', other: '45' };
    options.getReqParams = () => transformedParams;
    crudMiddlewareInstance = crudMiddleware(options);
    crud.remove.returns(new Promise(resolve => resolve()));
    crudMiddlewareInstance.remove(req, res).then(() => {
      expect(crud.remove.firstCall.args[0]).to.deep.equal(transformedParams);
      done();
    });
  });

  it('should respond with any errors encountered when removing a model by key', (done)=> {
    crud.remove.returns(new Promise((resolve, reject)=> { reject(expectedError); }));
    crudMiddlewareInstance.remove(req, res).catch(err => {
      expect(err).to.equal(expectedError);
      done();
    });
  });

});