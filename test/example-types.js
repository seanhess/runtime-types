// @flow
export type PhoneNumber = string;

export type User = {
  username: string;
  age: number;
  phone: PhoneNumber;
  created: ?Date;
}
