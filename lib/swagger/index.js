'use strict';

const _ = require('lodash');
const defaultOptions = require('./options');
const searchProperties = require('./search-control-properties');

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  const entityName = opts.entity.name;
  const entityPath = opts.entity.path || entityName;
  const readTags = [opts.tag.read.name || entityName];
  const writeTags = [opts.tag.write.name || entityName];

  const definitionNames = {
    creating: `${entityName}-creating`,
    updating: `${entityName}-updating`,
    finding: `${entityName}-finding`,
    counting: `${entityName}-counting`,
  };

  if (opts.useControlsFromQuery) {
    definitionNames.searchControls = `${entityName}-search-controls`;
  }

  function getOperation(config) {
    const cfg = config || {};
    return {
      tags: cfg.tags || writeTags,
      summary: cfg.summary || entityName,
      description: cfg.description || cfg.summary || entityName,
      parameters: cfg.parameters,
      responses: cfg.responses || opts.getResponses({ entityName })
    };
  }

  function getBodyParameters(config) {
    const cfg = config || {};
    return [{
      name: cfg.name || cfg.entityName || entityName,
      description: cfg.description || cfg.name || cfg.entityName || entityName,
      in: 'body',
      schema: { $ref: `#/definitions/${cfg.entityName || entityName}` }
    }];   
  }

  function getIdParameters(config) {
    const cfg = config || {};
    return [{
      name: cfg.name || opts.reqParamId,
      description: cfg.description || cfg.name || `Identifies ${entityName}`,
      in: 'path',
      required: true,
      type: 'string'
    }];   
  }

  function getSearchControlsQueryParameters() {
    if (!opts.useControlsFromQuery) { return []; }
    return Object.keys(searchProperties).map(name => Object.assign({ name, in: 'query' }, searchProperties[name]));
  }

  const rootWritePath = {};
  rootWritePath[`${opts.pathPrefix.write}/${entityPath}`] = {
    post: getOperation({
      summary: `Create ${entityName}`,
      parameters: getBodyParameters({ entityName: definitionNames.creating }),
      responses: opts.getResponses({ entityName, exclude: '404' })
    }),
    put: getOperation({
      summary: `Update ${entityName}`,
      parameters: getBodyParameters({ entityName: definitionNames.updating })
    })
  };
  
  const findPath = {};
  findPath[`${opts.pathPrefix.read}/${entityPath}/find`] = {
    post: getOperation({
      tags: readTags,
      summary: `Search for ${entityName}`,
      parameters: getBodyParameters({ name: 'conditions', entityName: definitionNames.finding }).concat(getSearchControlsQueryParameters()),
      responses: opts.getResponses({ entityName, arrayOf: true, exclude: '404' })
    })
  };
  
  const countPath = {};
  countPath[`${opts.pathPrefix.read}/${entityPath}/count`] = {
    post: getOperation({
      tags: readTags,
      summary: `Count ${entityName}`,
      parameters: getBodyParameters({ name: 'conditions', entityName: definitionNames.counting }),
      responses: opts.getResponses({ entityName: `${entityName}-count`, exclude: '404' })
    })
  };

  const idReadPath = {};
  idReadPath[`${opts.pathPrefix.read}/${entityPath}/{${opts.reqParamId}}`] = {
    get: getOperation({ tags: readTags, summary: `Get ${entityName}`, parameters: getIdParameters() })
  };

  const idWritePath = {};
  idWritePath[`${opts.pathPrefix.write}/${entityPath}/{${opts.reqParamId}}`] = {
    delete: getOperation({ summary: `Delete ${entityName}`, parameters: getIdParameters(), responses: opts.getResponses() })
  };

  const schemaWithoutId = Object.assign({}, opts.entity.schema);
  schemaWithoutId.properties = _.omit(opts.entity.schema.properties, '_id');

  const searchPropertiesWithoutControls = _.omit(opts.searchProperties, ['skip', 'limit']);

  const definitions = Object.assign({}, opts.errorDefinitions);
  definitions[entityName] = opts.entity.schema;
  definitions[definitionNames.updating] = Object.assign({}, opts.entity.schema);
  definitions[definitionNames.creating] = schemaWithoutId;
  definitions[definitionNames.finding] = {
    type: 'object',
    description: `Search parameters for ${entityName}`,
    properties: opts.useControlsFromQuery ? searchPropertiesWithoutControls : opts.searchProperties,
  };
  definitions[definitionNames.counting] = {
    type: 'object',
    description: `Search parameters for ${entityName}`,
    properties: searchPropertiesWithoutControls,
  };
  definitions[`${entityName}-count`] = {
    type: 'object',
    properties: {
      count: {
        type: 'number',
        format: 'int32',
        description: `Count of ${entityName}`,
      }
    }
  };

  if (opts.useControlsFromQuery) {
    definitions[definitionNames.searchControls] = {
      type: 'object',
      description: `Search controls for ${entityName}`,
      properties:  _.pick(opts.searchProperties, ['skip', 'limit']),
    };
  }

  const tags = _.uniqBy(_.filter([
    { name: opts.tag.read.name, description: opts.tag.read.description || opts.tag.read.name },
    { name: opts.tag.write.name, description: opts.tag.write.description || opts.tag.write.name },
    { name: entityName, description: entityName },
  ], tag => !!tag.name), 'name');

  const paths = _.merge(rootWritePath, findPath, countPath, idReadPath, idWritePath);

  return {
    options: opts,
    docs: { tags, paths, definitions },
    getOperation,
    getBodyParameters,
    getIdParameters,
    getSearchControlsQueryParameters,
  };
};
