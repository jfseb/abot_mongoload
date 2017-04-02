

var process = require('process');
var root = (process.env.FSD_COVERAGE) ? '../js_cov' : '../js';
var mQ = require(root + '/makeQuery.js');



exports.testMakeProjection = function (test) {
  var proj  = mQ.makeMongoProjection(
    ['BSPName', 'AppKey']);
  test.deepEqual(proj,{
    '$project': { _id: 0, BSPName : 1, AppKey : 1 }
  }
  , ' projection');
  test.done();
};


exports.testMakeMatch = function (test) {
  var proj  = mQ.makeMongoMatch(
    [{
      cat : 'BSPName',
      value : 'CPM_REUSE_MS1'
    }]);
  test.deepEqual(proj,   {
    $match: {
      BSPName : 'CPM_REUSE_MS1' }}
    , ' match');
  test.done();
};



exports.testMakeQuery = function (test) {
  var query  = mQ.makeMongoQuery(
    [{
      cat : 'BSPName',
      value : 'CPM_REUSE_MS1'
    }],
    ['BSPName', 'AppKey']
  );

  test.deepEqual(query,[
    { '$match': { BSPName: 'CPM_REUSE_MS1' } },
    { '$group': { _id: { BSPName : '$BSPName', AppKey : '$AppKey'},
      BSPName: '$BSPName', AppKey: '$AppKey' } },
    { '$project': {
      _id: 0, BSPName : 1, AppKey : 1 }}
  ], ' abc');
  test.done();
};

