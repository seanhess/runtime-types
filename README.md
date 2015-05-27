runtime-types
=============

Use flow type information at runtime. Automatically generate validation code, ORM schemas, etc from the type definition.

Installation
------------

    npm install --save runtime-types

Runtime Example
---------------

If this file is in ./example-types.js

    // @flow
    export type PhoneNumber = string;

    export type User = {
      username: string;
      age: number;
      phone: PhoneNumber;
      created: ?Date;
    }

You can import the type information as follows:

    var types = require('runtime-types')

    // read the file into a runtime type description
    var MyTypes = types.readFile(path.join(__dirname, '../test/example-types.js'))

    // MyTypes is now equal to:
    {
      PhoneNumber: { name: 'string' },

      User: {
        name: 'Object',
        properties: [
          { key: 'username', type: { name: 'string' } },
          { key: 'age',      type: { name: 'number' } },
          { key: 'phone',    type: { name: 'PhoneNumber' } },
          { key: 'created',  type: { name: 'Date', nullable: true } } 
        ]
      }
    }

Validation Example
------------------

You can use this description to create validators for your types

    var types = require('runtime-types')
    var validate = require('runtime-types/validate')

    var MyTypes = types.readFile(path.join(__dirname, '../test/example-types.js'))

    var VALIDATORS:ValidatorMap = {
      PhoneNumber: validate.validateRegex(/^\d{10}$/),
    }

    var validators = createAll(VALIDATORS, MyTypes)

Then you can check various objects to make sure they match `User` at runtime.

    var errs = validators.User({
      username: "bobby",
      age: 23,
      phone: "8014114399",
      created: null
    })

    // ==> []

Checks if fields are set

    var errs = validators.User({
      age: 23,
      phone: "8014114399"
    })

    // ==> [ { key: 'username', value: undefined, error: 'missing' } ]
    // no error for created because it is nullable

Checks correct typeof for `string`, `number` and `boolean`

    var errs = validators.User({
      username: "bobby",
      age: "not an age",
      phone: "8014114399",
    })

    // ==> [ { key: 'age', value: 'not an age', error: 'expected typeof number' } ]

Checks instances for `Date`

    var errs = validators.User({
      username: "bobby",
      age: 23,
      phone: "8014114399",
      created: 1432757991843 // was supposed to be date, not a timestamp
    })

    // [ { key: 'created',
    //     value: 1432757991843,
    //     error: 'expected instance of function Date() { [native code] }' } ]

Provided Validators: regex

    var VALIDATORS:ValidatorMap = {
      PhoneNumber: validate.validateRegex(/^\d{10}$/),
    }

    var validators = createAll(VALIDATORS, MyTypes)

    var errs = validators.User({
      username: "bobby",
      age: 23,
      phone: "801-443-8899", // should be 10 digits without hyphens
    })

    // [ { key: 'phone',
    //     value: '801-411-4399',
    //     error: 'did not match /^\\d{10}$/' }, ]

Custom Validators: anything

    var VALIDATORS:ValidatorMap = {
      PhoneNumber: function(value) {
        if (value.length == 10) {
          return true
        }
        else {
          return "wrong length!"
        }
      }
    }

It does not try to guess validators for your type aliases. If you forget to provide one it will throw an error when you generate the validators

    var VALIDATORS:ValidatorMap = {}

    var validators = createAll(VALIDATORS, MyTypes)

    // Error: Could not find validator for type: PhoneNumber

Mapping to ORM Schemas
----------------------

Coming soon. Will be similar to implementation of `validate.js`


API: runtime-types
------------------

readFile. See [example](#runtime-example)

    // read a file synchronously and return a type definition for each type alias found
    // keys are the name of the alias
    // values are the type description
    // you should run this when your program starts

    readFile(filepath:string):ObjectMap<Type>;

Property and Type

    type Property = {
      key: string;
      type: Type;
      optional?: boolean;
    }

    type Type = {
      name: string; // number, string, boolean, Post, User, Array

      literal?: string; // for string literals

      nullable?: boolean;

      // only filled for object types
      properties?: Array<Property>;

      // only filled for generics, like Array<XX>
      params?: Array<Type>;
    }

    export type ObjectMap<T> = {[key: string]: T}

API: validate
-------------

Create a single validator.

    type ValidateObject = (value:Object) => Array<KeyedError>

    create(map:ValidatorMap, type:Type):ValidateObject;

Create a map of validators, with keys equal to the name of the types

    createAll(map:ValidatorMap, types:ObjectMap<Type>):ObjectMap<ValidateObject>;

Provided Validators:

    validateExists():Validator;

    validateTypeOf(type:string):Validator;

    validateInstanceOf(type:any):Validator;

    validateRegex(regex:RegExp):Validator;

Other Types

    type Validator<T> = (value:T) => ValidationResult

    type ValidationError = string;

    // either true, or a string with the error
    // use === true to test
    type ValidationResult = boolean | ValidationError;

    type KeyedError = {
      key: string;
      value: string;
      error: ValidationError;
    }

Validation Map

    type ValidatorMap = {[key:string]:Validator}

    // the default validation map, override by passing to `create`

    var VALIDATORS_BY_TYPE:ValidatorMap = {
      "string"  : validateTypeOf("string"),
      "number"  : validateTypeOf("number"),
      "boolean" : validateTypeOf("boolean"),
      "Date"    : validateInstanceOf(Date),
    }

