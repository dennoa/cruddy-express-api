'use strict';

const _ = require('lodash');
const defaultOptions = require('./options');

module.exports = options => {

  let opts = _.merge({}, defaultOptions, options);

  let entityResponse = {
    '200': {
      description: opts.entity.name,
      schema: {
        $ref: '#/definitions/' + opts.entity.name
      }
    }
  };

  let bodyParameters = (name, suffix) => [{ 
    name: name, 
    in: 'body', 
    schema: {
      $ref: '#/definitions/' + opts.entity.name + suffix
    } 
  }];

  let rootWritePath = {};
  rootWritePath[opts.pathPrefix.write + '/' + opts.entity.name] = {
    post:{
      tags: [opts.tag.write.name || opts.entity.name],
      summary: 'Create ' + opts.entity.name,
      description: 'Create ' + opts.entity.name,
      parameters: bodyParameters(opts.entity.name, '-creating'),
      responses: _.merge({}, entityResponse, opts.getErrorResponses({ exclude: '404' }))
    },
    put: {
      tags: [opts.tag.write.name || opts.entity.name],
      summary: 'Update ' + opts.entity.name,
      description: 'Update ' + opts.entity.name,
      parameters: bodyParameters(opts.entity.name, '-updating'),
      responses: _.merge({}, entityResponse, opts.getErrorResponses())
    }
  };
  
  let findPath = {};
  findPath[opts.pathPrefix.read + '/' + opts.entity.name + '/find'] = {
    post: {
      tags: [opts.tag.read.name || opts.entity.name],
      summary: 'Search for ' + opts.entity.name,
      description: 'Search for ' + opts.entity.name,
      parameters: bodyParameters('conditions', '-finding'),
      responses: _.merge({
        '200': {
          description: 'List of ' + opts.entity.name,
          schema: {
            type: 'array',
            items: {
              $ref: '#/definitions/' + opts.entity.name
            }
          }
        }
      }, opts.getErrorResponses({ exclude: '404' }))
    }
  };
  
  let countPath = {};
  countPath[opts.pathPrefix.read + '/' + opts.entity.name + '/count'] = {
    post: {
      tags: [opts.tag.read.name || opts.entity.name],
      summary: 'Count ' + opts.entity.name,
      description: 'Count ' + opts.entity.name,
      parameters: bodyParameters('conditions', '-counting'),
      responses: _.merge({
        '200': {
          description: 'Count of ' + opts.entity.name,
          schema: {
            $ref: '#/definitions/' + opts.entity.name + '-count'
          }
        }
      }, opts.getErrorResponses({ exclude: '404' }))
    }
  };

  let idParameters = [{
    name: opts.reqParamId,
    in: 'path',
    description: 'Identifies the ' + opts.entity.name,
    required: true,
    type: 'string'
  }];

  let idReadPath = {};
  idReadPath[opts.pathPrefix.read + '/' + opts.entity.name + '/{' + opts.reqParamId + '}'] = {
    get: {
      tags: [opts.tag.read.name || opts.entity.name],
      summary: 'Get ' + opts.entity.name,
      description: 'Get ' + opts.entity.name,
      parameters: idParameters,
      responses: _.merge({}, entityResponse, opts.getErrorResponses({ exclude: '400' }))
    }
  };

  let idWritePath = {};
  idWritePath[opts.pathPrefix.write + '/' + opts.entity.name + '/{' + opts.reqParamId + '}'] = {
    delete: {
      tags: [opts.tag.write.name || opts.entity.name],
      summary: 'Delete ' + opts.entity.name,
      description: 'Delete ' + opts.entity.name,
      parameters: idParameters,
      responses: _.merge({
        '204': {
          description: 'Success'
        }
      }, opts.getErrorResponses({ exclude: '400' }))
    }
  };

  let schemaWithoutId = _.merge({}, opts.entity.schema);
  schemaWithoutId.properties = _.omit(opts.entity.schema.properties, '_id');

  let definitions = {};
  definitions[opts.entity.name] = opts.entity.schema;
  definitions[opts.entity.name + '-updating'] = _.merge({}, opts.entity.schema);
  definitions[opts.entity.name + '-creating'] = schemaWithoutId;
  definitions[opts.entity.name + '-finding'] = {
    type: 'object',
    description: 'Search parameters for ' + opts.entity.name,
    properties: opts.searchProperties
  };
  definitions[opts.entity.name + '-counting'] = {
    type: 'object',
    description: 'Search parameters for ' + opts.entity.name,
    properties: _.omit(opts.searchProperties, ['skip', 'limit'])
  };
  definitions[opts.entity.name + '-count'] = {
    type: 'object',
    properties: {
      count: {
        type: 'number',
        format: 'int32',
        description: 'The number of ' + opts.entity.name
      }
    }
  };

  let tags = _.uniqBy(_.filter([
    { name: opts.tag.read.name, description: opts.tag.read.description || opts.tag.read.name },
    { name: opts.tag.write.name, description: opts.tag.write.description || opts.tag.write.name },
    { name: opts.entity.name, description: opts.entity.name }
  ], tag => !!tag.name), 'name');

  return {
    options: opts,
    docs: {
      tags:tags,
      paths: _.merge(rootWritePath, findPath, countPath, idReadPath, idWritePath),
      definitions: _.merge(definitions, opts.errorDefinitions)
    }
  };

};