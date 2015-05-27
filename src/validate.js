// @flow
import {Type, Property} from './parse'
import {flatten, extend, constant, find} from 'lodash'

export type Validator<T> = (value:T) => ValidationResult
export type ValidationError = string;
// either true, or a string with the error
// use === true to test
export type ValidationResult = boolean | ValidationError;

export type ValidatorMap = {[key:string]:Validator}

export type KeyedError = {
  key: string;
  error: ValidationError;
}

type KeyedValidator = [string, Validator];

//export type Property = {
  //key: string;
  //type: Type;
  //optional?: boolean;
//}

//export type Type = {
  //name: string; // number, string, boolean, Post, User, Array
  //literal?: string; // for string literals
  //nullable?: boolean;
  //properties?: Array<Property>;
  //params?: Array<Type>;
//}

var VALIDATORS_BY_TYPE:ValidatorMap = {
  "string"  : validateTypeOf("string"),
  "number"  : validateTypeOf("number"),
  "boolean" : validateTypeOf("boolean"),
  "Date"    : validateInstanceOf(Date),
}

export function validateAll(vs:Array<KeyedValidator>, obj:Object):Array<KeyedError> {
  var maybeErrs:Array<?KeyedError> = vs.map(function(kv) {
    return validate(kv, obj)
  })

  var errs:any = maybeErrs.filter(function(err:?KeyedError):boolean {
    return (err !== undefined)
  })

  return errs
}

export function validate([key, validator]:KeyedValidator, obj:Object):?KeyedError {
  // this runs the validator
  var result = validator(obj[key])
  if (!valid(result)) {
    return {key: key, error: (result : any)}
  }
}

export function valid(result:ValidationResult):boolean {
  return result === true
}


//export function combine(vs:Array<Validator>):Validator {
  //// return a function that evaluates all of them
  //return function(val) {
    //// run all of them, and return the message for the first one that fails
    //var failed = vs.map(function(validator) {
      //return validator(val) !== true
    //})

    //if (failed) {
      //return {
        //valid: false,
        //message: failed.message
      //}
    //}

    //else {
      //return {
        //valid: true
      //}
    //}
  //}
//}

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

export function validators(map:ValidatorMap, type:Type):Array<KeyedValidator> {
  var fullMap:ValidatorMap = extend(map, VALIDATORS_BY_TYPE)
  if (type.properties) {
    return objToValidators(fullMap, type.properties)
  }

  else {
    throw new Error("Meant to be called with an object type")
  }
}


function objToValidators(map:ValidatorMap, props:Array<Property>):Array<KeyedValidator> {
  return props.map(function(prop) {
    return propToValidator(map, prop)
  })
}

// I need a way to compose validators...
// all   -> runs all validators
// first -> runs them in order, stopping after the first

//////////////////////////////////////////////////////////////
// Validators
//////////////////////////////////////////////////////////////

// how can I allow them to map it themselves?
// they can specify their own mapping function? and call mine...

// can I make validators simpler? 
// right now they need the key
// but ... can I just add the key on later?
// like, a validator doesn't have to add the key stuff.
// it's the same in every single one!

// RULES: should leverage a simple boolean function
// an error message that doesn't depend on the value

// the key should be specified somewhere else?
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
    return (val.match(regex)) || "did not match " + regex
  }
}

function exists(value):boolean {
  return !(value === undefined || value === null)
}

//export type MemberOffer = {
  //global_member_offer_uuid: GUID; --- Required, Custom Regex

  //// 7 digit phone number with no punctuation
  //account_number: PhoneNumber; --- Required, Custom Regex

  //global_offer_id: ID; --- Required, check is a number (between x and y?)
  //awarded_global_location_id: ID; --- check is a number (greater than 0)
	//earned_date: Date; -- instanceof Date and exists
	//start_date: ?Date; -- if it exists, it must be an instanceof Date
	//expire_date: Date; -- 
//}
