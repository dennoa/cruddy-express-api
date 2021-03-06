# cruddy-express-api
CRUD stuff to help with a REST api

Comprises a model to expose the various functions and express middleware to route requests.

## Installation

    npm install --save cruddy-express-api

## Example usage

### Model

    const model = require('./my-mongoose-model');

    module.exports = require('cruddy-express-api').model({ model });

Provides: crudModel.create, crudModel.update, crudModel.get, crudModel.remove, crudModel.find, crudModel.count and crudModel.options

### Middleware

    const crudModel = require('./my-model'); //Refers to above example

    const crudMiddleware = require('cruddy-express-api').middleware({
      getCrudModel: () => crudModel,
    });

    router.use(crudMiddleware.routes);

Provides: crudMiddleware.routes, crudMiddleware.create, crudMiddleware.update, crudMiddleware.get, crudMiddleware.remove, crudMiddleware.find, crudMiddleware.count and crudMiddleware.options

crudMiddleware.routes works with requests like this:
* POST / to create
* PUT / to update
* POST /find to search using the data in the request body
* POST /count to count using the data in the request body
* GET /:key to get by key
* DELETE /:key to remove

### Swagger

    const crudSwagger = require('cruddy-express-api').swagger({
      entity: {
        name: 'my-entity',
        schema: {
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
        }
      }
    });

    const swaggerDocs = _.merge({}, crudSwagger.docs, theRestOfMyDocs);

Provides: crudSwagger.options, crudSwagger.docs, crudSwagger.getOperation, crudSwagger.getBodyParameters, crudSwagger.getIdParameters

#### getOperation

You can use crudSwagger.getOperation to leverage some default behaviour and reduce the amount of configuration required for other swagger docs. For example:

    paths: {
      '/my-entity/clone': {
        post: crudSwagger.getOperation({
          summary: 'Clone my thing',
          parameters: [{ name: 'Options',  in: 'body',  schema: { $ref: '#/definitions/clone-my-thing' } }]
        })
      } 
    }

The getOperation method takes an object that overrides the default behaviour:

    {
      tags: array defaulting to the same tags array on the create operation,
      summary: string defaulting to the entity name,
      description: string defaulting to the summary,
      parameters: array with no default,
      responses: object defaulting to the output from crudSwagger.options.getResponses({ entityName })
    }

#### getBodyParameters

You can likewise use crudSwagger.getBodyParameters:

    paths: {
      '/my-entity/clone': {
        post: crudSwagger.getOperation({
          summary: 'Clone my thing',
          parameters: getBodyParameters({ name: 'Options', entityName: 'clone-my-thing' })
        })
      } 
    }

The getBodyParameters method takes an object that overrides the default behaviour:

    {
      entityName: required string,
      name: string defaulting to the specified entityName,
      description: string defaulting to the specified name,
    }

#### getIdParameters

You can likewise use crudSwagger.getIdParameters:

    paths: {
      '/my-entity/{_id}/red': {
        get: crudSwagger.getOperation({
          summary: 'Get my thing in red',
          parameters: getIdParameters()
        })
      } 
    }

The getIdParameters method takes an object that overrides the default behaviour:

    {
      name: string defaulting to the configured reqParamId,
      description: string defaulting to the specified name or Identifies entityName,
    }

## Options

### Model

    {
      getKeyConditions: doc => ({ _id: doc._id }),
      getDefaultValues: () => null,
      transformForSave: doc => doc
    }

* getKeyConditions is used by the update method to extract mongoose findOne conditions from the document being updated.
* getDefaultValues is used by the create method to include default values in the document being created.
* transformForSave is used by both create and update to transform the incoming document before it is saved.

### Middleware

    const respond = require('promise-to-respond');

    module.exports = {
      getCrudModel: () => { throw new Error('Must provide an implementation for getCrudModel'); },
      getReqParams: req => req.params,
      respond: respond(),
      validateRequest: (req, validationRules) => Promise.resolve(),
      create: {
        rules: {},
        getReqBody: req => req.body,
      },
      update: {
        rules: {},
        getReqBody: req => req.body,
      },
      find: {
        rules: {},
        getReqBody: req => req.body,
        getControls: body => _.merge({ skip: 0, limit: 20 }, _.pick(body, ['skip', 'limit'])),
        useControlsFromQuery: false,
        getConditions: () => null
      },
      get: {
        rules: { _id: { in: 'params', isMongoId: { errorMessage: 'invalid' } } },
      },
      remove: {
        rules: { _id: { in: 'params', isMongoId: { errorMessage: 'invalid' } } },
      },
      reqParamId: '_id'
    };

* getCrudModel must be specified. It is a function that returns something that supports the crudModel method signatures.
* getReqParams can be overridden if you need to pass something other than req.params to the get and remove operations.
* respond can be overridden. For example to transform the payload before responding. It is a function with parameters (res, promise).
* validateRequest is a way to hook into validation middleware like express-validator. It is called for create, update and find requests.
* create.getReqBody can be overridden if you need to pass something other than req.body to the create operation.
* create.rules are the validation rules that will be passed to validateRequest on create. See below for notes on rules.
* update.getReqBody can be overridden if you need to pass something other than req.body to the update operation.
* update.rules are the validation rules that will be passed to validateRequest on update. See below for notes on rules.
* find.getReqBody can be overridden if you need to pass something other than req.body to the find and count operations.
* find.rules are the validation rules that will be passed to validateRequest on find and count. See below for notes on rules.
* find.getControls is a function that is passed the req.body and returns { skip, limit } to be appended to the query returned from crudModel.find.
* find.useControlsFromQuery indicates whether or not the search controls should come from the querystring.
* find.getConditions is a function that is passed the req.body and returns the relevant mongoose conditions for the find operation.
* get.rules are the validation rules that will be passed to validateRequest on get. The default rule verifies the reqParamId value is a mongo id. See below for notes on rules.
* remove.rules are the validation rules that will be passed to validateRequest on remove. The default rule verifies the reqParamId value is a mongo id. See below for notes on rules.
* reqParamId is the name of the request parameter used on the GET and DELETE requests.
* rules are passed to validateRequest without change except where rules is a function. In this case, it is called with the request and response - e.g. rules(req, res) and the result passed to validateRequest. If the function returns a promise, the resolved value is passed to validateRequest. A rejected promise is handled by respond as any other rejected promise would be.

### Swagger docs

    {
      entity: {
        name: 'please-specify-the-entity-name',
        path: null,
        schema: {
          type: 'object',
          properties: {} 
        }
      },
      pathPrefix: { read: '', write: '' },
      tag: {
        read: { name: null, description: null },
        write: { name: null, description: null }
      },
      reqParamId: '_id',
      getErrorResponses,
      getResponses,
      errorDefinitions,
      searchProperties,
    }

* entity.name must be specified. It is the name of the entity acted upon by the CRUD operations.
* entity.path can be specified if you want the path to be something other than the entity name.
* entity.schema can be overridden to define your entity schema.
* pathPrefix.read can be set to the base path for retrieval operations if you want to separate them from the others.
* pathPrefix.write can be set to the base path for update operations if you want to separate them from the others.
* tag.read can specify an alternate tag for retrieval operations.
* tag.write can specify an alternate tag for update operations.
* reqParamId is the id that will be used for the GET and DELETE operations.
* getErrorResponses can be overridden. This function can be passed { exclude: ? } to leave out any of the included errors: 400, 401, 404 and 500.
  The exclude option can be a string or an array.
* getResponses can be overridden. This function can be passed { exclude: ?, entityName: ?, arrayOf: ? } where: (i) exclude leaves out any responses as per above behaviour, (ii) entityName if specified indicates a 200 response of a definition called entityName, if not specified indicates 204, (iii) arrayOf is only relevant if entityName is specified and indicates the response is an array of a definition called entityName.
* errorDefinitions can be overridden. Defaults include validation-errors (400) and system-error (500).
* searchProperties can be overridden. Default provides property docs for the skip and limit search controls.

Docs are created for all of the paths accessible via the middleware and also for the following definitions:
* #/definitions/{entity-name} is the schema provided via entity.schema. It is used in the response for create, update, find and get
* #/definitions/{entity-name}-updating defines the parameters allowable on an update request
* #/definitions/{entity-name}-creating defines the parameters allowable on a create request
* #/definitions/{entity-name}-finding defines the parameters allowable on a find request. These are the searchProperties
* #/definitions/{entity-name}-counting defines the parameters allowable on a count request. These are the searchProperties without skip and limit
* #/definitions/{entity-name}-count defines the response to a count request
