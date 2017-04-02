'use strict'

// based on: http://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Levenshtein_distance
// and:  http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance

import * as mongoose from 'mongoose';
import * as m2s from './model2schema.js';

export interface IFilter {
  cat : string,
  value : string
};

/* construct a mongo query from an AST */

export function makeMongoDistinctGroup(cols : string[]) : any {
  var res = { $group : { _id : {} } };
  cols.forEach(col => {
    res.$group[col] = '$' + col;
    res.$group._id[col]  = '$' + col;
  });
  return res;
}

export function makeMongoMatch(filters: IFilter[]) {
  var res = { $match : {}};
  filters.forEach(filter => {
    res.$match[ filter.cat ] = filter.value;
  });
  return res;
}

export function makeMongoProjection(cols : string[]) : any {
  var res = { $project : { _id : 0 } };
  cols.forEach(col => {
    res.$project[col] = 1;
  });
  return res;
}

export function makeMongoQuery(filters : IFilter[], resultcolumns : string[]) : any {

  var filter = makeMongoMatch(filters);
  var group = makeMongoDistinctGroup(resultcolumns);
  var projection = makeMongoProjection(resultcolumns);
  return [filter,group,projection];

}
