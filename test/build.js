// test the build process
var path = require('path')
var types = require('../build')
var validate = require('../build/validate')

var VALIDATORS = {
  GUID: validateGUID(),
  PhoneNumber: validate.validateRegex(/^\d{9}$/),
  ID: validate.validateTypeOf('number')
}

function validateGUID() {
  return function(guid) {
    return true
  }
}

function validatePhoneNumber() {
  return function(phone) {
    if (phone.length != 9) {
      return "invalid phone number: " + phone
    }
    return true
  }
}

var sample = {
  global_member_offer_uuid: "asdf",
  account_number: "12345678a",
  global_offer_id: 1234,
  awarded_global_location_id: 2134,
  earned_date: new Date(),
  start_date: null,
  expire_date: new Date(),
}



// ------------------------

// find all the types in a given file
var Types = types.readFile(path.join(__dirname, './example-types.js'))

// create validators for all the types
var validators = validate.createAll(VALIDATORS, Types)
var errs = validators.MemberOffer(sample)
console.log("ERRS", errs)
