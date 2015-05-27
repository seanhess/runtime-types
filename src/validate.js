// @flow

// TODO FEATURE support nested objects

import {Type, Property, ObjectMap} from './types'
import {flatten, extend, constant, find} from 'lodash'

export type Validator<T> = (value:T) => ValidationResult
export type ValidationError = string;
// either true, or a string with the error
// use === true to test
export type ValidationResult = boolean | ValidationError;

export type ValidatorMap = {[key:string]:Validator}

export type ValidateObject = (value:Object) => Array<KeyedError>

export type KeyedError = {
  key: string;
  value: string;
  error: ValidationError;
}

type KeyedValidator = [string, Validator];


// -------------------------------------------------------------

// create a single validator: a function to call with your object
// it will return an array of errors

export function create(map:ValidatorMap, type:Type):ValidateObject {
  var vs = typeValidators(map, type)
  return function(obj) {
    return validateAll(vs, obj)
  }
}

export function createAll(map:ValidatorMap, types:ObjectMap<Type>):ObjectMap<ValidateObject> {
  var vs = {}
  for (var name in types) {
    vs[name] = create(map, types[name])
  }
  return vs
}


// ---------------------------------------------------------------

var VALIDATORS_BY_TYPE:ValidatorMap = {
  "string"  : validateTypeOf("string"),
  "number"  : validateTypeOf("number"),
  "boolean" : validateTypeOf("boolean"),
  "Date"    : validateInstanceOf(Date),
}

function validateAll(vs:Array<KeyedValidator>, obj:Object):Array<KeyedError> {
  var maybeErrs:Array<?KeyedError> = vs.map(function(kv) {
    return validate(kv, obj)
  })

  var errs:any = maybeErrs.filter(function(err:?KeyedError):boolean {
    return (err !== undefined)
  })

  return errs
}

function validate([key, validator]:KeyedValidator, obj:Object):?KeyedError {
  // this runs the validator
  var result = validator(obj[key])
  if (!valid(result)) {
    return {key: key, value: obj[key], error: (result : any)}
  }
}

function valid(result:ValidationResult):boolean {
  return result === true
}

//////////////////////////////////////////////////////////////////////////

// turns a property into a validator
// ignore optional, it doesn't work right
function propToValidator(map:ValidatorMap, prop:Property):KeyedValidator {
  return typeToValidator(map, prop.key, prop.type)
}

// just do required for now?
// you want to allow them to override the mapping
// especially for their custom types!
function typeToValidator(map:ValidatorMap, key:string, type:Type):KeyedValidator {

  // now run the type-based validator
  var validator = map[type.name]

  if (!validator) {
    throw new Error("Could not find validator for type: " + type.name)
  }

  function isValid(value) {
    if (!exists(value)) {
      // if the property doesn't exist, and it's not a nullable property
      // otherwise just do the second one
      if (type.nullable) {
        return true
      }

      else {
        return "missing"
      }
    }

    else {
      return validator(value)
    }
  }

  return [key, isValid]
}

function typeValidators(map:ValidatorMap, type:Type):Array<KeyedValidator> {
  var fullMap:ValidatorMap = extend(map, VALIDATORS_BY_TYPE)
  if (type.properties) {
    return objToValidators(fullMap, type.properties)
  }

  else {
    return [typeToValidator(map, "", type)]
  }
}

function objToValidators(map:ValidatorMap, props:Array<Property>):Array<KeyedValidator> {
  return props.map(function(prop) {
    return propToValidator(map, prop)
  })
}

//////////////////////////////////////////////////////////////
// Validators
//////////////////////////////////////////////////////////////

export function validateExists():Validator {
  return function(val) {
    return exists(val) || "missing"
  }
}

export function validateTypeOf(type:string):Validator {
  return function(val) {
    return (typeof val === type) || "expected typeof " + type
  }
}

export function validateInstanceOf(type:any):Validator {
  return function(val) {
    return (val instanceof type) || "expected instance of " + type
  }
}

export function validateRegex(regex:RegExp):Validator {
  return function(val) {
    return (regex.test(val)) || "did not match " + regex
  }
}

function exists(value):boolean {
  return !(value === undefined || value === null)
}

