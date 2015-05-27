// @flow
var path = require('path')
import {fileTypes} from '../src/parse'
import {validators, validateAll, ValidationError, validateTypeOf} from '../src/validate'


var VALIDATORS = {
  GUID: validateGUID,
  PhoneNumber: validatePhoneNumber,
  ID: validateTypeOf('number')
}

function validateGUID(guid):?ValidationError {
  return undefined
}

function validatePhoneNumber(phone:PhoneNumber):?ValidationError {
  if (phone.length != 9) {
    return "invalid phone number: " + phone
  }
}

export type GUID = string;
export type PhoneNumber = string;
export type ID = number;

export type MemberOffer = {
  global_member_offer_uuid: GUID; // Required, Custom Regex

  // 7 digit phone number with no punctuation
  account_number: PhoneNumber; // Required, Custom Regex

  global_offer_id: ID; // Required, check is a number (between x and y?)
  awarded_global_location_id: ID; // check is a number (greater than 0)
  earned_date: Date; // instanceof Date and exists
  start_date: ?Date; // if it exists, it must be an instanceof Date
  expire_date: Date; // 
}

var sample:MemberOffer = {
  global_member_offer_uuid: "asdf",
  account_number: "142356789",
  global_offer_id: 1234,
  awarded_global_location_id: 2134,
  earned_date: new Date(),
  start_date: null,
  expire_date: new Date(),
}

// ------------------------

// find all the types in a given file
var types = fileTypes(path.join(__dirname, '..', 'test', 'test.js'))

console.log("TYPES", types.MemberOffer)
var vs = validators(VALIDATORS, types.MemberOffer)
console.log("vs", vs)
var errs = validateAll(vs, sample)
console.log("ERRS", errs)
//console.log("TYPES", types.User.properties)
