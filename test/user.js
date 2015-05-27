// @flow

import {Post} from './post'

type ID = string;

type User = {
  id: ID;
  username: ?string;
  name: {first: string; last: string};
  age?: number;
  updated: Date;
  employer: Employer;
  posts: Array<Post>;
  test: "test";
  something: any;
  save: Function;
}

class Employer {
  test() {}
}

var user:User = {
  id: "",
  username: "",
  age: 4,
  updated: new Date(),
  name: {first: "henry", last: "bob"},
  employer: new Employer(),
  posts: [],
  test: "test",
  something: "woot",
  save: () => undefined
}
