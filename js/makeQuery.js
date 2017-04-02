'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
;
/* construct a mongo query from an AST */
function makeMongoDistinctGroup(cols) {
    var res = { $group: { _id: {} } };
    cols.forEach(col => {
        res.$group[col] = '$' + col;
        res.$group._id[col] = '$' + col;
    });
    return res;
}
exports.makeMongoDistinctGroup = makeMongoDistinctGroup;
function makeMongoMatch(filters) {
    var res = { $match: {} };
    filters.forEach(filter => {
        res.$match[filter.cat] = filter.value;
    });
    return res;
}
exports.makeMongoMatch = makeMongoMatch;
function makeMongoProjection(cols) {
    var res = { $project: { _id: 0 } };
    cols.forEach(col => {
        res.$project[col] = 1;
    });
    return res;
}
exports.makeMongoProjection = makeMongoProjection;
function makeMongoQuery(filters, resultcolumns) {
    var filter = makeMongoMatch(filters);
    var group = makeMongoDistinctGroup(resultcolumns);
    var projection = makeMongoProjection(resultcolumns);
    return [filter, group, projection];
}
exports.makeMongoQuery = makeMongoQuery;

//# sourceMappingURL=makeQuery.js.map
