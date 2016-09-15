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
      parameters: bodyParameters(opts.entity.name, '-without-id'),
      responses: _.merge({}, entityResponse, opts.errorResponses({ exclude: '404' }))
    },
    put: {
      tags: [opts.tag.write.name || opts.entity.name],
      summary: 'Update ' + opts.entity.name,
      description: 'Update ' + opts.entity.name,
      parameters: bodyParameters(opts.entity.name, ''),
      responses: _.merge({}, entityResponse, opts.errorResponses())
    }
  };
  
  let findPath = {};
  findPath[opts.pathPrefix.read + '/' + opts.entity.name + '/find'] = {
    post: {
      tags: [opts.tag.read.name || opts.entity.name],
      summary: 'Search for ' + opts.entity.name,
      description: 'Search for ' + opts.entity.name,
      parameters: bodyParameters('conditions', '-find-conditions'),
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
      }, opts.errorResponses({ exclude: '404' }))
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
      responses: _.merge({}, entityResponse, opts.errorResponses({ exclude: '400' }))
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
      }, opts.errorResponses({ exclude: '400' }))
    }
  };

  let withoutIdSchema = _.merge({}, opts.entity.schema);
  withoutIdSchema.properties = _.omit(opts.entity.schema.properties, '_id');

  let definitions = {};
  definitions[opts.entity.name] = opts.entity.schema;
  definitions[opts.entity.name + '-without-id'] = withoutIdSchema;
  definitions[opts.entity.name + '-find-conditions'] = {
    type: 'object',
    description: 'Search parameters for ' + opts.entity.name,
    properties: opts.searchProperties
  };

  let tags = _.uniqBy(_.filter([
    { name: opts.entity.name, description: opts.entity.name },
    { name: opts.tag.read.name, description: opts.tag.read.description || opts.tag.read.name },
    { name: opts.tag.write.name, description: opts.tag.write.description || opts.tag.write.name }
  ], tag => !!tag.name), 'name');

  return {
    tags:tags,
    paths: _.merge(rootWritePath, findPath, idReadPath, idWritePath),
    definitions: _.merge(definitions, opts.errorDefinitions)
  };

};