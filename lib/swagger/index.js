'use strict';

const _ = require('lodash');
const defaultOptions = require('./options');

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  const entityName = opts.entity.name;
  const entityPath = opts.entity.path || entityName;

  const entityResponse = {
    '200': {
      description: entityName,
      schema: {
        $ref: `#/definitions/${entityName}`
      }
    }
  };

  const bodyParameters = (name, suffix) => [{ 
    name, 
    in: 'body', 
    schema: {
      $ref: `#/definitions/${entityName}${suffix}`
    } 
  }];

  const rootWritePath = {};
  rootWritePath[`${opts.pathPrefix.write}/${entityPath}`] = {
    post:{
      tags: [opts.tag.write.name || entityName],
      summary: `Create ${entityName}`,
      description: `Create ${entityName}`,
      parameters: bodyParameters(entityName, '-creating'),
      responses: _.merge({}, entityResponse, opts.getErrorResponses({ exclude: '404' }))
    },
    put: {
      tags: [opts.tag.write.name || entityName],
      summary: `Update ${entityName}`,
      description: `Update ${entityName}`,
      parameters: bodyParameters(entityName, '-updating'),
      responses: _.merge({}, entityResponse, opts.getErrorResponses())
    }
  };
  
  const findPath = {};
  findPath[`${opts.pathPrefix.read}/${entityPath}/find`] = {
    post: {
      tags: [opts.tag.read.name || entityName],
      summary: `Search for ${entityName}`,
      description: `Search for ${entityName}`,
      parameters: bodyParameters('conditions', '-finding'),
      responses: _.merge({
        '200': {
          description: `List of ${entityName}`,
          schema: {
            type: 'array',
            items: {
              $ref: `#/definitions/${entityName}`
            }
          }
        }
      }, opts.getErrorResponses({ exclude: '404' }))
    }
  };
  
  const countPath = {};
  countPath[`${opts.pathPrefix.read}/${entityPath}/count`] = {
    post: {
      tags: [opts.tag.read.name || entityName],
      summary: `Count ${entityName}`,
      description: `Count ${entityName}`,
      parameters: bodyParameters('conditions', '-counting'),
      responses: _.merge({
        '200': {
          description: `Count of ${entityName}`,
          schema: {
            $ref: `#/definitions/${entityName}-count`
          }
        }
      }, opts.getErrorResponses({ exclude: '404' }))
    }
  };

  const idParameters = [{
    name: opts.reqParamId,
    in: 'path',
    description: `Identifies the ${entityName}`,
    required: true,
    type: 'string'
  }];

  const idReadPath = {};
  idReadPath[`${opts.pathPrefix.read}/${entityPath}/{${opts.reqParamId}}`] = {
    get: {
      tags: [opts.tag.read.name || entityName],
      summary: `Get ${entityName}`,
      description: `Get ${entityName}`,
      parameters: idParameters,
      responses: _.merge({}, entityResponse, opts.getErrorResponses({ exclude: '400' }))
    }
  };

  const idWritePath = {};
  idWritePath[`${opts.pathPrefix.write}/${entityPath}/{${opts.reqParamId}}`] = {
    delete: {
      tags: [opts.tag.write.name || entityName],
      summary: `Delete ${entityName}`,
      description: `Delete ${entityName}`,
      parameters: idParameters,
      responses: _.merge({
        '204': {
          description: 'Success'
        }
      }, opts.getErrorResponses({ exclude: '400' }))
    }
  };

  const schemaWithoutId = _.merge({}, opts.entity.schema);
  schemaWithoutId.properties = _.omit(opts.entity.schema.properties, '_id');

  const definitions = {};
  definitions[entityName] = opts.entity.schema;
  definitions[`${entityName}-updating`] = _.merge({}, opts.entity.schema);
  definitions[`${entityName}-creating`] = schemaWithoutId;
  definitions[`${entityName}-finding`] = {
    type: 'object',
    description: `Search parameters for ${entityName}`,
    properties: opts.searchProperties
  };
  definitions[`${entityName}-counting`] = {
    type: 'object',
    description: `Search parameters for ${entityName}`,
    properties: _.omit(opts.searchProperties, ['skip', 'limit'])
  };
  definitions[`${entityName}-count`] = {
    type: 'object',
    properties: {
      count: {
        type: 'number',
        format: 'int32',
        description: `Count of ${entityName}`
      }
    }
  };

  const tags = _.uniqBy(_.filter([
    { name: opts.tag.read.name, description: opts.tag.read.description || opts.tag.read.name },
    { name: opts.tag.write.name, description: opts.tag.write.description || opts.tag.write.name },
    { name: entityName, description: entityName }
  ], tag => !!tag.name), 'name');

  return {
    options: opts,
    docs: {
      tags,
      paths: _.merge(rootWritePath, findPath, countPath, idReadPath, idWritePath),
      definitions: _.merge(definitions, opts.errorDefinitions)
    }
  };
};
