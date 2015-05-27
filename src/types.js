// @flow

export type ObjectMap<T> = {[key: string]: T}

export type Property = {
  key: string;
  type: Type;
  optional?: boolean;
}

export type Type = {
  name: string; // number, string, boolean, Post, User, Array

  literal?: string; // for string literals

  nullable?: boolean;

  // only filled for object types
  properties?: Array<Property>;

  // only filled for generics, like Array<XX>
  params?: Array<Type>;
}
