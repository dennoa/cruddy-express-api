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
      model: MyMongooseModel,
      getKeyConditions: doc => { 
        return { key: doc.key }; 
      }),
      getDefaultValues: () => { 
        return { rating: 3 }; 
      }
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
* GET /:key to get by key
* DELETE /:key to remove

## Options

### Model

    {
      getKeyConditions: doc => { 
        return { key: doc.key }; 
      },
      getDefaultValues: () => null
    }

* getKeyConditions is used by the update method to extract mongoose findOne conditions from the document being updated.
* getDefaultValues is used by the create method to include default values in the document being created

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
      }
    };

* getCrudModel must be specified. It is a function that returns something that supports the crudModel method signatures.
* respond can be overridden. For example to transform the payload before responding. It is a function with parameters (res, promise).
* validateRequest is a way to hook into validation middleware like express-validator. It is called for create, update and find requests.
* create.rules are the validation rules that will be passed to validateRequest on create.
* update.rules are the validation rules that will be passed to validateRequest on update.
* find.rules are the validation rules that will be passed to validateRequest on find.
* find.getControls is a function that is passed the req.body and returns { skip, limit } to be appended to the query returned from crudModel.find.
* find.getConditions is a function that is passed the req.body and returns the relevant mongoose conditions for the find operation.
