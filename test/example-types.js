// @flow
export type PhoneNumber = string;

export type User = {
  username: string;
  age: number;
  phone: PhoneNumber;
  created: ?Date;
}

export type Kiosk = {
  mac_address: string;
  global_location_id: number;
  settings: {[key:string] : string};
  stuffs: {
    message: string;
  }
}
