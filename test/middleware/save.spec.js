'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudMiddleware = require('../../lib').middleware;

describe('crud-middleware save operation', ()=> {

  const expectedError = 'Expected for testing';
  let req, res, crud, options, crudMiddlewareInstance;

  beforeEach(()=> {
    req = { body: {} };
    res = { status: sinon.stub().returns({ json: sinon.stub() })};
    crud = {
      create: sinon.stub().returns(Promise.reject()),
      update: sinon.stub().returns(Promise.reject())
    };
    options = {
      getCrudModel: () => crud,
      validateRequest: sinon.stub().returns(Promise.resolve()),
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

  it('should require a crud model', done => {
    try {
      crudMiddlewareInstance = crudMiddleware();
      done('Should not be able to instantiate a crud middleware instance without a crud model');
    } catch(e) {
      expect(e.message).to.equal('Must provide an implementation for getCrudModel');
      done();
    }
  });

  it('should pass validation by default if no validateRequest function is provided', done => {
    crudMiddlewareInstance = crudMiddleware({ getCrudModel: () => crud });
    crudMiddlewareInstance.options.validateRequest().then(done);
  });

  it('should create a model', done => {
    const doc = { key: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.create.returns(new Promise(resolve => resolve(doc)));
    req.body = doc;
    crudMiddlewareInstance.create(req, res).then(created => {
      expect(crud.create.calledWith(req.body)).to.equal(true);
      expect(created).to.deep.equal(doc);
      done();
    });
  });

  it('should run request validation using the create rules', done => {
    crud.create.returns(Promise.resolve({}));
    crudMiddlewareInstance.create(req, res).then(created => {
      expect(options.validateRequest.calledWith(req, options.create.rules)).to.equal(true);
      done();
    });
  });

  it('should allow the create rules to be a function and call it with (req, res) if so', done => {
    const derivedRules = { key: { isMongoId: { errorMessage: 'invalid' } } };
    options.create.rules = sinon.stub().returns(derivedRules);
    crud.create.returns(Promise.resolve({}));
    crudMiddleware(options).create(req, res).then(created => {
      expect(options.validateRequest.calledWith(req, derivedRules)).to.equal(true);
      expect(options.create.rules.calledWith(req, res)).to.equal(true);
      done();
    });
  });

  it('should allow the create rules function to return a promise', done => {
    const derivedRules = { key: { isMongoId: { errorMessage: 'invalid' } } };
    options.create.rules = () => new Promise(resolve => process.nextTick(() => resolve(derivedRules)));
    crud.create.returns(Promise.resolve({}));
    crudMiddleware(options).create(req, res).then(created => {
      expect(options.validateRequest.calledWith(req, derivedRules)).to.equal(true);
      done();
    });
  });

  it('should get the data to be created from the getReqBody function', done => {
    const transformedRequestBody = { my: 'data' };
    options.create.getReqBody = () => transformedRequestBody;
    crudMiddlewareInstance = crudMiddleware(options);
    crud.create.returns(Promise.resolve({}));
    crudMiddlewareInstance.create(req, res).then(created => {
      expect(crud.create.firstCall.args[0]).to.deep.equal(transformedRequestBody);
      done();
    });
  });

  it('should return any unexpected error encountered when creating a model', done => {
    const doc = { key: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.create.returns(new Promise((resolve, reject) => reject(expectedError)));
    req.body = doc;
    crudMiddlewareInstance.create(req, res).catch(err => {
      expect(err).to.equal(expectedError);
      done();
    });
  });

  it('should update a model', done => {
    const doc = { key: '234', dateTo: '2016-10-06T07:25:10.759Z' };
    crud.update.returns(new Promise(resolve => resolve(doc)));
    req.body = doc;
    crudMiddlewareInstance.update(req, res).then(updated => {
      expect(crud.update.calledWith(req.body)).to.equal(true);
      expect(updated).to.deep.equal(doc);
      done();
    });
  });

  it('should run request validation using the update rules', done => {
    crud.update.returns(Promise.resolve({}));
    crudMiddlewareInstance.update(req, res).then(updated => {
      expect(options.validateRequest.calledWith(req, options.update.rules)).to.equal(true);
      done();
    });
  });

  ['create', 'update'].forEach(method => {
    it(`should fail if request validation fails on ${method}`, done => {
      const error = new crudMiddlewareInstance.ValidationError([{ param: 'key', msg: 'invalid' }]);
      options.validateRequest = () => { throw error; };
      crudMiddleware(options)[method](req, res).catch(result => {
        expect(result).to.equal(error);
        done();
      });
    });

    it(`should fail if the rules promise rejects on ${method}`, done => {
      const error = new crudMiddlewareInstance.ValidationError([{ param: 'key', msg: 'invalid' }]);
      options[method].rules = () => Promise.reject(error);
      crudMiddleware(options)[method](req, res).catch(result => {
        expect(result).to.equal(error);
        done();
      });
    });
  });

  it('should allow the update rules to be a function and call it with (req, res) if so', done => {
    const derivedRules = { key: { isMongoId: { errorMessage: 'invalid' } } };
    options.update.rules = sinon.stub().returns(derivedRules);
    crud.update.returns(Promise.resolve({}));
    crudMiddleware(options).update(req, res).then(() => {
      expect(options.validateRequest.calledWith(req, derivedRules)).to.equal(true);
      expect(options.update.rules.calledWith(req, res)).to.equal(true);
      done();
    });
  });

  it('should allow the update rules function to return a promise', done => {
    const derivedRules = { key: { isMongoId: { errorMessage: 'invalid' } } };
    options.update.rules = () => new Promise(resolve => process.nextTick(() => resolve(derivedRules)));
    crud.update.returns(Promise.resolve({}));
    crudMiddleware(options).update(req, res).then(() => {
      expect(options.validateRequest.calledWith(req, derivedRules)).to.equal(true);
      done();
    });
  });

  it('should get the data to be updated from the getReqBody function', done => {
    const transformedRequestBody = { my: 'data' };
    options.update.getReqBody = () => transformedRequestBody;
    crudMiddlewareInstance = crudMiddleware(options);
    crud.update.returns(Promise.resolve({}));
    crudMiddlewareInstance.update(req, res).then(updated => {
      expect(crud.update.firstCall.args[0]).to.deep.equal(transformedRequestBody);
      done();
    });
  });

  it('should return any unexpected error encountered when updating a model', done => {
    const doc = { key: '234', dateFrom: '2016-09-06T07:25:10.759Z' };
    crud.update.returns(Promise.reject(expectedError));
    req.body = doc;
    crudMiddlewareInstance.update(req, res).catch(err => {
      expect(err).to.equal(expectedError);
      done();
    });
  });

});