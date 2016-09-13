'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const crudModel = require('../lib').model;

describe('crud model', ()=> {

  let findExec, options, crudInstance;
  let expectedError = 'Expected for testing';

  beforeEach(()=> {
    findExec = sinon.stub().returns(new Promise(resolve => resolve(null)));
    options = {
      model: {
        create: sinon.stub().returns(new Promise(resolve => resolve(null))),
        findOne: sinon.stub().returns({ exec: findExec }),
        find: sinon.stub().returns({ exec: findExec })
      },
      getDefaultValues: () => null,
      getKeyConditions: (doc => { return { key: doc.key }; })
    };
    crudInstance = crudModel(options);
  });

  afterEach(()=> {
  });

  it('should create a new model', (done)=> {
    let doc = { key: 'some key', dateFrom: new Date(), data: 'some data' };
    crudInstance.create(doc).then(()=> {
      let args = options.model.create.firstCall.args[0];
      expect(args.key).to.equal(doc.key);
      expect(args.dateFrom).to.equal(doc.dateFrom);
      expect(args.data).to.equal(doc.data);
      done();
    });
  });

  it('should allow default values to be specified when creating a new model', (done)=> {
    let dateFrom = new Date();
    options.getDefaultValues = () => {
      return {
        dateFrom: dateFrom,
        accessCount: 0
      };
    };
    let doc = { key: 'some key' };
    crudInstance = crudModel(options);
    crudInstance.create(doc).then(()=> {
      let args = options.model.create.firstCall.args[0];
      expect(args.key).to.equal(doc.key);
      expect(args.dateFrom).to.equal(dateFrom);
      expect(args.accessCount).to.equal(0);
      done();
    });
  });

  it('should get an existing model', (done) => {
    let existing = { key: 'some key', dateFrom: new Date() };
    findExec.returns(new Promise(resolve => resolve(existing)));
    crudInstance.get({ key: existing.key }).then(found => {
      expect(found).to.deep.equal(existing);
      done();
    });
  });

  it('should reject with an empty reason when trying to get a model that does not exist', (done) => {
    crudInstance.get({ key: 'not found' }).catch(reason => {
      expect(typeof reason === 'undefined').to.equal(true);
      done();
    });
  });

  it('should reject with an error when it fails to get a model because of something unexpected', (done) => {
    findExec.returns(new Promise((resolve, reject) => reject(expectedError)));
    crudInstance.get({ key: 'some-key' }).catch(reason => {
      expect(reason).to.equal(expectedError);
      done();
    });
  });

  it('should update an existing model', (done) => {
    let existing = { key: 'some key', dateFrom: new Date(), save: sinon.stub().yields() };
    findExec.returns(new Promise(resolve => resolve(existing)));
    let doc = { key: existing.key, dateTo: new Date(), isAdmin: true };
    crudInstance.update(doc).then(updated => {
      expect(updated.key).to.equal(existing.key);
      expect(updated.dateFrom).to.equal(existing.dateFrom);
      expect(updated.dateTo).to.equal(doc.dateTo);
      expect(updated.isAdmin).to.equal(doc.isAdmin);
      done();
    });
  });

  it('should reject with an error when it fails to update a model because of something unexpected when retrieving', (done) => {
    findExec.returns(new Promise((resolve, reject) => reject(expectedError)));
    let doc = { key: 'my-key', dateTo: new Date(), isAdmin: true };
    crudInstance.update(doc).catch(reason => {
      expect(reason).to.equal(expectedError);
      done();
    });
  });

  it('should reject with an error when it fails to update a model because of something unexpected when saving', (done) => {
    let existing = { key: 'some key', dateFrom: new Date(), save: sinon.stub().yields(expectedError) };
    findExec.returns(new Promise(resolve => resolve(existing)));
    let doc = { key: existing.key, dateTo: new Date(), isAdmin: true };
    crudInstance.update(doc).catch(reason => {
      expect(reason).to.equal(expectedError);
      done();
    });
  });

  it('should remove an existing model', (done) => {
    let existing = { key: 'some key', dateFrom: new Date(), remove: sinon.stub().yields() };
    findExec.returns(new Promise(resolve => resolve(existing)));
    crudInstance.remove({ key: existing.key }).then(done);
  });

  it('should reject with an error when it fails to remove a model because of something unexpected when retrieving', (done) => {
    findExec.returns(new Promise((resolve, reject) => reject(expectedError)));
    crudInstance.remove({ key: 'some-key' }).catch(reason => {
      expect(reason).to.equal(expectedError);
      done();
    });
  });

  it('should reject with an error when it fails to remove a model because of something unexpected when deleting', (done) => {
    let existing = { key: 'some key', dateFrom: new Date(), remove: sinon.stub().yields(expectedError) };
    findExec.returns(new Promise(resolve => resolve(existing)));
    crudInstance.remove({ key: 'key' }).catch(reason => {
      expect(reason).to.equal(expectedError);
      done();
    });
  });

  it('should find a model using the provided conditions', (done) => {
    let conditions = { dateFrom: { $gte: new Date() }};
    crudInstance.find(conditions).exec().then(results => {
      expect(options.model.find.calledWith(conditions)).to.equal(true);
      done();
    });
  });

});