'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const crudSwagger = require('../lib').swagger;

describe('swagger docs', ()=> {

  let options;

  beforeEach(()=> {
    options = {
      entity: {
        name: 'my-entity'
      }
    };
  });

  it('should generate tags', ()=> {
    let docs = crudSwagger(options);
    expect(docs.tags.length).to.equal(1);
    expect(docs.tags[0].name).to.equal('my-entity');
    expect(docs.tags[0].description).to.equal('my-entity');
  });

  ['read', 'write'].forEach(action => {
    it('should generate ' + action + ' tags', ()=> {
      options.tag = {};
      options.tag[action] = { name: 'my-entity-admin', description: 'my-entity administration' };
      let docs = crudSwagger(options);
      expect(docs.tags.length).to.equal(2);
      expect(_.filter(docs.tags, tag => tag.name === 'my-entity-admin')[0]).to.deep.equal(options.tag[action]);
    });
  });

  it('should generate read and write tags', ()=> {
    options.tag = { 
      read: { name: 'my-entity-read', description: 'my-entity read' },
      write: { name: 'my-entity-write', description: 'my-entity write' },
    };
    let docs = crudSwagger(options);
    expect(docs.tags.length).to.equal(3);
    ['my-entity','my-entity-read','my-entity-write'].forEach(name => {
      expect(_.filter(docs.tags, tag => tag.name === name).length).to.equal(1);
    });
  });

  ['post','put'].forEach(method => {
    it('should generate docs for ' + method + ' /my-entity', ()=> {
      let docs = crudSwagger(options);
      expect(!!docs.paths['/my-entity'][method]).to.equal(true);
    });
  });

  ['get','delete'].forEach(method => {
    it('should generate docs for ' + method + ' /my-entity/{_id}', ()=> {
      let docs = crudSwagger(options);
      expect(!!docs.paths['/my-entity/{_id}'][method]).to.equal(true);
    });
  });

  ['', '-without-id', '-find-conditions'].forEach(suffix => {
    it('should generate definitions for my-entity' + suffix, () => {
      let docs = crudSwagger(options);
      expect(!!docs.definitions['my-entity' + suffix]).to.equal(true);
    });
  });

  ['validation-errors', 'system-error'].forEach(error => {
    it('should include definitions for ' + error, () => {
      let docs = crudSwagger(options);
      expect(!!docs.definitions[error]).to.equal(true);
    });
  });

  ['skip', 'limit'].forEach(control => {
    it('should include the ' + control + ' property in the default find conditions', () => {
      let docs = crudSwagger(options);
      expect(!!docs.definitions['my-entity-find-conditions'].properties[control]).to.equal(true);
    });
  });

  ['get','delete'].forEach(method => {
    it('should allow a different path parameter name for the ' + method + ' operation', ()=> {
      options.reqParamId = 'key';
      let docs = crudSwagger(options);
      expect(!!docs.paths['/my-entity/{key}'][method]).to.equal(true);
    });
  });

  it('should allow a path prefix for the read operations', ()=> {
    options.pathPrefix = { read: '/public' };
    let docs = crudSwagger(options);
    expect(!!docs.paths['/public/my-entity/find'].post).to.equal(true);
    expect(!!docs.paths['/public/my-entity/{_id}'].get).to.equal(true);
  });

  it('should allow a path prefix for the write operations', ()=> {
    options.pathPrefix = { write: '/admin' };
    let docs = crudSwagger(options);
    expect(!!docs.paths['/admin/my-entity'].post).to.equal(true);
    expect(!!docs.paths['/admin/my-entity'].put).to.equal(true);
    expect(!!docs.paths['/admin/my-entity/{_id}'].delete).to.equal(true);
  });

  it('should allow specification of the entity schema', () => {
    options.entity.schema = {
      type: 'object',
      description: 'My entity',
      properties: {
        _id: {
          type: 'string',
          description: 'Unique identifier for my entity'
        },
        myProperty: {
          type: 'string',
          description: 'My property'
        }
      }
    };
    let docs = crudSwagger(options);
    expect(docs.definitions['my-entity'].properties.myProperty.description).to.equal('My property');
  });

});