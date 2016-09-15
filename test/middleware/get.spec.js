'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware get operation', ()=> {

  let expectedError = 'Expected for testing';
  let req, res, crud, crudMiddlewareInstance;

  beforeEach(()=> {
    req = { params: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    crud = {
      get: sinon.stub().returns(new Promise((resolve, reject) => reject()))
    };
    crudMiddlewareInstance = crudMiddleware({
      getCrudModel: () => crud,
      respond: (res, promise) => promise
    });
  });

  it('should get a model by _id', (done) => {
    let doc = { _id: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.get.returns(new Promise(resolve => resolve(doc)));
    req.params._id = doc._id;
    crudMiddlewareInstance.get(req, res).then(found => {
      expect(crud.get.firstCall.args[0]).to.deep.equal(req.params);
      expect(found).to.deep.equal(doc);
      done();
    });
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