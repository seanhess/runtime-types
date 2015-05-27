// @flow
import {Type, Property} from './parse'
import {flatten, extend} from 'lodash'

export type ValidationError = string;
export type Validator<T> = (value:T) => ?ValidationError;
export type ValidatorMap = {[key:string]:Validator}
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

export function validateAll(vs:Array<KeyedValidator>, obj:Object):Array<ValidationError> {
  var maybeErrs:Array<any> = vs.map(function(kv) {
    return validate(kv, obj)
  })

  var errs:Array<ValidationError> = maybeErrs.filter(function(err:?ValidationError):boolean {
    return !!err
  })

  return errs
}

export function validate([key, validator]:KeyedValidator, obj:Object):?ValidationError {
  var err = validator(obj[key])
  if (err) {
    err = key + ": " + err
  }
  return err
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
    // check to see if it exists
    // if nullable, then run only validator
    // if NOT nullable, then run both 

    // not allowed to be null. Both must be true
    if (!type.nullable) {
      var err = validateExists(value)
      if (err) {
        return err
      }
      else {
        return validator(value)
      }
    }
    // it IS nullable, only check to see if it is valid if it exists
    else if (!missing(value)){
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

// the key should be specified somewhere else?
export function validateExists(value:?any):?ValidationError {
  if (missing(value)) {
    return "missing"
  }
}

// string, number, boolean
export function validateTypeOf(type:string):Validator {
  return function(value:any) {
    var tof = typeof value
    if (tof !== type) {
      return "expected " + type + " but found " + tof
    }
  }
}

export function validateInstanceOf(type:any):Validator {
  return function(value:any) {
    if (!(value instanceof type)) {
      return "expected " + type + " but was not instance"
    }
  }
}

export function validateRegex(regex:RegExp):Validator {
  return function(value:string) {
    if (!value.match(regex)) {
      return "could not match " + value + " against " + regex
    }
  }
}

function missing(value):boolean {
  return (value === undefined || value === null)
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
