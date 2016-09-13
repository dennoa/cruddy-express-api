'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware save operation', ()=> {

  let expectedError = 'Expected for testing';
  let req, res, crud, options, crudMiddlewareInstance;

  beforeEach(()=> {
    req = { body: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    crud = {
      create: sinon.stub().returns(new Promise((resolve, reject) => reject())),
      update: sinon.stub().returns(new Promise((resolve, reject) => reject()))
    };
    options = {
      getCrudModel: () => crud,
      validateRequest: sinon.stub().returns(new Promise(resolve => resolve())),
      create: {
        rules: {
          key: { optional: true, isKeyAvailable: { errorMessage: 'unavailable' }}
        }
      },
      update: {
        rules: {
          key: { isLength: { options: [{ min: 1 }], errorMessage: 'required' }}
        }
      },
      respond: (res, promise) => promise
    };
    crudMiddlewareInstance = crudMiddleware(options);
  });

  it('should create a model', (done) => {
    let doc = { key: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.create.returns(new Promise(resolve => resolve(doc)));
    req.body = doc;
    crudMiddlewareInstance.create(req, res).then(created => {
      expect(crud.create.calledWith(req.body)).to.equal(true);
      expect(created).to.deep.equal(doc);
      done();
    });
  });

  it('should run request validation using the create rules', (done) => {
    crud.create.returns(new Promise(resolve => resolve({})));
    crudMiddlewareInstance.create(req, res).then(created => {
      expect(options.validateRequest.calledWith(req, options.create.rules)).to.equal(true);
      done();
    });
  });

  it('should return any unexpected error encountered when creating a model', (done) => {
    let doc = { key: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.create.returns(new Promise((resolve, reject) => reject(expectedError)));
    req.body = doc;
    crudMiddlewareInstance.create(req, res).catch(err => {
      expect(err).to.equal(expectedError);
      done();
    });
  });

  it('should update a model', (done) => {
    let doc = { key: '234', dateTo: '2016-10-06T07:25:10.759Z' };
    crud.update.returns(new Promise(resolve => resolve(doc)));
    req.body = doc;
    crudMiddlewareInstance.update(req, res).then(updated => {
      expect(crud.update.calledWith(req.body)).to.equal(true);
      expect(updated).to.deep.equal(doc);
      done();
    });
  });

  it('should run request validation using the update rules', (done) => {
    crud.update.returns(new Promise(resolve => resolve({})));
    crudMiddlewareInstance.update(req, res).then(updated => {
      expect(options.validateRequest.calledWith(req, options.update.rules)).to.equal(true);
      done();
    });
  });

  it('should return any unexpected error encountered when updating a model', (done) => {
    let doc = { key: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.update.returns(new Promise((resolve, reject) => reject(expectedError)));
    req.body = doc;
    crudMiddlewareInstance.update(req, res).catch(err => {
      expect(err).to.equal(expectedError);
      done();
    });
  });

});