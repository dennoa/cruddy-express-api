# cruddy-express-api
CRUD stuff to help with a REST api

Comprises a model to expose the various functions and express middleware to route requests.

## Installation

    npm install --save cruddy-express-api

## Example usage

### Model

    const _ require('lodash');
    const MyMongooseModel = require('./my-model');

    const crudModel = require('cruddy-express-api').model({
      model: MyMongooseModel
    });
    
    module.exports = _.merge({
      other: other
    }, crudModel);

Provides: crudModel.create, crudModel.update, crudModel.get, crudModel.remove, crudModel.find and crudModel.options

### middleware

    const crudModel = require('./my-model'); //Refers to above example

    const crudMiddleware = require('cruddy-express-api').middleware({
      getCrudModel: () => crudModel
    });

    router.use(crudMiddleware.routes);

Provides: crudMiddleware.routes, crudMiddleware.create, crudMiddleware.update, crudMiddleware.get, crudMiddleware.remove, crudMiddleware.find and crudMiddleware.options

crudMiddleware.routes works with requests like this:
* POST / to create
* PUT / to update
* POST /find to search using the data in the request body
* POST /count to count using the data in the request body
* GET /:key to get by key
* DELETE /:key to remove

### Swagger docs

    const entityDocs = require('cruddy-express-api').swagger({
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

    let swaggerDocs = _.merge({}, entityDocs, theRestOfMyDocs);

## Options

### Model

    {
      getKeyConditions: doc => { 
        return { _id: doc._id }; 
      },
      getDefaultValues: () => null,
      transformForSave: doc => doc
    }

* getKeyConditions is used by the update method to extract mongoose findOne conditions from the document being updated.
* getDefaultValues is used by the create method to include default values in the document being created.
* transformForSave is used by both create and update to transform the incoming document before it is saved.

### Middleware

    {
      getCrudModel: () => { throw new Error('Must provide an implementation for getCrudModel'); },
      respond: require('promise-to-respond')(),
      validateRequest: (req, validationRules) => new Promise(resolve => resolve()),
      create: {
        rules: {}
      },
      update: {
        rules: {}
      },
      find: {
        rules: {},
        getControls: () => {
          return {
            skip: 0,
            limit: 20
          };
        },
        getConditions: () => null
      },
      reqParamId: '_id'
    }

* getCrudModel must be specified. It is a function that returns something that supports the crudModel method signatures.
* respond can be overridden. For example to transform the payload before responding. It is a function with parameters (res, promise).
* validateRequest is a way to hook into validation middleware like express-validator. It is called for create, update and find requests.
* create.rules are the validation rules that will be passed to validateRequest on create.
* update.rules are the validation rules that will be passed to validateRequest on update.
* find.rules are the validation rules that will be passed to validateRequest on find and count.
* find.getControls is a function that is passed the req.body and returns { skip, limit } to be appended to the query returned from crudModel.find.
* find.getConditions is a function that is passed the req.body and returns the relevant mongoose conditions for the find operation.
* reqParamId is the name of the request parameter used on the GET and DELETE requests. 
  The req.params object becomes the conditions passed through to the corresponding crudModel methods. 

### Swagger docs

    {
      entity: {
        name: 'please-specify-the-entity-name',
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
      getErrorResponses: getErrorResponses,
      errorDefinitions: errorDefinitions,
      searchProperties: searchControlProperties
    }

* entity.name must be specified. It is the name of the entity acted upon by the CRUD operations.
* entity.schema can be overridden to define your entity schema.
* pathPrefix.read can be set to the base path for retrieval operations if you want to separate them from the others.
* pathPrefix.write can be set to the base path for update operations if you want to separate them from the others.
* tag.read can specify an alternate tag for retrieval operations.
* tag.write can specify an alternate tag for update operations.
* reqParamId is the id that will be used for the GET and DELETE operations.
* getErrorResponses can be overridden. This is a function that can be passed { exclude: ? } to leave out any of the included errors: 400, 401, 404 and 500.
  The exclude option can be a string or an array.
* errorDefinitions can be overridden. Defaults include validation-errors (400) and system-error (500).
* searchProperties can be overridden. Default provides property docs for the skip and limit search controls.

Docs are created for all of the paths accessible via the middleware and also for the following definitions:
* #/definitions/{entity-name} is the schema provided via entity.schema. It is used in the response for create, update, find and get
* #/definitions/{entity-name}-updating defines the parameters allowable on an update request
* #/definitions/{entity-name}-creating defines the parameters allowable on a create request
* #/definitions/{entity-name}-finding defines the parameters allowable on a find request. These are the searchProperties
* #/definitions/{entity-name}-counting defines the parameters allowable on a count request. These are the searchProperties without skip and limit
* #/definitions/{entity-name}-count defines the response to a count request
