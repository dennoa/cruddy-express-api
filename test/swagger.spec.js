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
    const docs = crudSwagger(options).docs;
    expect(docs.tags).to.deep.equal([{ name: 'my-entity', description: 'my-entity' }]);
  });

  ['read', 'write'].forEach(action => {
    it('should generate ' + action + ' tags', ()=> {
      options.tag = {};
      options.tag[action] = { name: 'my-entity-admin', description: 'my-entity administration' };
      const docs = crudSwagger(options).docs;
      expect(docs.tags.length).to.equal(2);
      expect(_.filter(docs.tags, tag => tag.name === 'my-entity-admin')[0]).to.deep.equal(options.tag[action]);
    });
  });

  it('should generate read and write tags', ()=> {
    options.tag = { 
      read: { name: 'my-entity-read', description: 'my-entity read' },
      write: { name: 'my-entity-write', description: 'my-entity write' },
    };
    const docs = crudSwagger(options).docs;
    expect(docs.tags.length).to.equal(3);
    ['my-entity','my-entity-read','my-entity-write'].forEach(name => {
      expect(_.filter(docs.tags, tag => tag.name === name).length).to.equal(1);
    });
  });

  ['post','put'].forEach(method => {
    it('should generate docs for ' + method + ' /my-entity', ()=> {
      const docs = crudSwagger(options).docs;
      expect(!!docs.paths['/my-entity'][method]).to.equal(true);
    });
  });

  ['get','delete'].forEach(method => {
    it('should generate docs for ' + method + ' /my-entity/{_id}', ()=> {
      const docs = crudSwagger(options).docs;
      expect(!!docs.paths['/my-entity/{_id}'][method]).to.equal(true);
    });
  });

  ['', '-creating', '-updating', '-finding', '-count'].forEach(suffix => {
    it('should generate definitions for my-entity' + suffix, () => {
      const docs = crudSwagger(options).docs;
      expect(!!docs.definitions['my-entity' + suffix]).to.equal(true);
    });
  });

  ['validation-errors', 'system-error'].forEach(error => {
    it('should include definitions for ' + error, () => {
      const docs = crudSwagger(options).docs;
      expect(!!docs.definitions[error]).to.equal(true);
    });
  });

  ['skip', 'limit'].forEach(control => {
    it('should include the ' + control + ' property in the default find conditions', () => {
      const docs = crudSwagger(options).docs;
      expect(!!docs.definitions['my-entity-finding'].properties[control]).to.equal(true);
    });
  });

  ['get','delete'].forEach(method => {
    it('should allow a different path parameter name for the ' + method + ' operation', ()=> {
      options.reqParamId = 'key';
      const docs = crudSwagger(options).docs;
      expect(!!docs.paths['/my-entity/{key}'][method]).to.equal(true);
    });
  });

  it('should allow a path prefix for the read operations', ()=> {
    options.pathPrefix = { read: '/public' };
    const docs = crudSwagger(options).docs;
    expect(!!docs.paths['/public/my-entity/find'].post).to.equal(true);
    expect(!!docs.paths['/public/my-entity/{_id}'].get).to.equal(true);
  });

  it('should allow a path prefix for the write operations', ()=> {
    options.pathPrefix = { write: '/admin' };
    const docs = crudSwagger(options).docs;
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
    const docs = crudSwagger(options).docs;
    expect(docs.definitions['my-entity']).to.deep.equal(options.entity.schema);
  });

  it('should allow search controls to be specified in the querystring', () => {
    options.useControlsFromQuery = true;
    const docs = crudSwagger(options).docs;
    const parameters = docs.paths['/my-entity/find'].post.parameters;
    expect(parameters.filter(param => param.in === 'query').length).to.equal(2);
  });

  it('should expose the configured options', ()=> {
    expect(!!crudSwagger(options).options).to.equal(true);
  });

  describe('getOperation', () => {

    let cs, defaultValues;
    beforeEach(() => {
      cs = crudSwagger(options);
      defaultValues = {
        tags: ['my-entity'],
        summary: 'my-entity',
        description: 'my-entity',
        parameters: undefined,
        responses: cs.options.getResponses({ entityName: 'my-entity' })
      };
    });

    it('should allow getOperation to be called with no arguments', () => {
      expect(cs.getOperation()).to.deep.equal(defaultValues);
    });

    it('should allow tags to be overridden', () => {
      const tags = ['my-entity', 'my-other-tag'];
      expect(cs.getOperation({ tags })).to.deep.equal(Object.assign(defaultValues, { tags }));
    });

    it('should allow summary to be overridden', () => {
      const summary = 'something else';
      expect(cs.getOperation({ summary })).to.deep.equal(Object.assign(defaultValues, { summary, description: summary }));
    });

    it('should allow description to be overridden', () => {
      const description = 'something else';
      expect(cs.getOperation({ description })).to.deep.equal(Object.assign(defaultValues, { description }));
    });

    it('should allow parameters to be overridden', () => {
      const parameters = [{ name: 'Options',  in: 'body',  schema: { $ref: '#/definitions/overriding-my-thing' } }];
      expect(cs.getOperation({ parameters })).to.deep.equal(Object.assign(defaultValues, { parameters }));
    });

    it('should allow responses to be overridden', () => {
      const responses = cs.options.getResponses({ exclude: '404' });
      expect(cs.getOperation({ responses })).to.deep.equal(Object.assign(defaultValues, { responses }));
    });
  });

});