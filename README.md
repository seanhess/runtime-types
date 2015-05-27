runtime-types
=============

Use flow type information at runtime. Automatically generate validation code, ORM schemas, etc from the type definition.

Installation
------------

    npm install --save runtime-types

Runtime Example
---------------

If this file is in ./example-types.js

```js
// @flow
export type PhoneNumber = string;

export type User = {
  username: string;
  age: number;
  phone: PhoneNumber;
  created: ?Date;
}
```

You can import the type information as follows:

```js
var types = require('runtime-types')
var path  = require('path')

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
```

Validation Example
------------------

You can use the object provided by `readFile` to create validators for your types

```js
var types = require('runtime-types')
var validate = require('runtime-types').validate

var MyTypes = types.readFile(path.join(__dirname, '../test/example-types.js'))

var VALIDATORS = {
  PhoneNumber: validate.validateRegex(/^\d{10}$/),
}

var validators = validate.createAll(VALIDATORS, MyTypes)
```

Then you can check various objects to make sure they match `User` at runtime.

```js
var errs = validators.User({
  username: "bobby",
  age: 23,
  phone: "8014114399",
  created: null
})

// ==> []
```

Checks if fields are set

```js
var errs = validators.User({
  age: 23,
  phone: "8014114399"
})

// ==> [ { key: 'username', value: undefined, error: 'missing' } ]
// no error for created because it is nullable
```

Checks correct typeof for `string`, `number` and `boolean`

```js
var errs = validators.User({
  username: "bobby",
  age: "not an age",
  phone: "8014114399",
})

// ==> [ { key: 'age', value: 'not an age', error: 'expected typeof number' } ]
```

Checks instances for `Date`

```js
var errs = validators.User({
  username: "bobby",
  age: 23,
  phone: "8014114399",
  created: 1432757991843 // was supposed to be date, not a timestamp
})

// [ { key: 'created',
//     value: 1432757991843,
//     error: 'expected instance of function Date() { [native code] }' } ]
```

Provided Validators: regex

```js
var VALIDATORS:ValidatorMap = {
  PhoneNumber: validate.validateRegex(/^\d{10}$/),
}

var validators = validate.createAll(VALIDATORS, MyTypes)

var errs = validators.User({
  username: "bobby",
  age: 23,
  phone: "801-443-8899", // should be 10 digits without hyphens
})

// [ { key: 'phone',
//     value: '801-411-4399',
//     error: 'did not match /^\\d{10}$/' }, ]
```

Custom Validators: anything

```js
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
```

It does not try to guess validators for your type aliases. If you forget to provide one it will throw an error when you generate the validators

```js
var VALIDATORS:ValidatorMap = {}

var validators = validate.createAll(VALIDATORS, MyTypes)

// Error: Could not find validator for type: PhoneNumber
```

Mapping to ORM Schemas
----------------------

Coming soon. Will be similar to implementation of `validate.js`


API: runtime-types
------------------

readFile. See [example](#runtime-example)

```js
// read a file synchronously and return a type definition for each type alias found
// keys are the name of the alias
// values are the type description
// you should run this when your program starts

readFile(filepath:string):ObjectMap<Type>;
```

Property and Type

```js
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
```

API: validate
-------------

See the [example](#validation-example)

This library returns `ValidateObject` functions: they accept an object and return an array of errors

```js
type ValidationError = string;

type KeyedError = {
  key: string;
  value: string;
  error: ValidationError;
}

type ValidateObject = (value:Object) => Array<KeyedError>
```

Create a single validate function

```js
create(map:ValidatorMap, type:Type):ValidateObject;
```

Create a map of validation functions, with keys equal to the name of the types

```js
createAll(map:ValidatorMap, types:ObjectMap<Type>):ObjectMap<ValidateObject>;
```

Validators are the functions that you use as building blocks. They return either `true` or an error message

```js
type Validator<T> = (value:T) => ValidationResult

// use === true to test
type ValidationResult = boolean | ValidationError;
```

Provided Validators:

```js
validateExists():Validator;

validateTypeOf(type:string):Validator;

validateInstanceOf(type:any):Validator;

validateRegex(regex:RegExp):Validator;
```


The ValidationMap connects types to validators

```js
type ValidatorMap = {[key:string]:Validator}

// the default validation map, override by passing to `create`

var VALIDATORS_BY_TYPE:ValidatorMap = {
  "string"  : validateTypeOf("string"),
  "number"  : validateTypeOf("number"),
  "boolean" : validateTypeOf("boolean"),
  "Date"    : validateInstanceOf(Date),
  "Object"  : validateExists(),
}
```

