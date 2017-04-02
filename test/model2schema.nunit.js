

var process = require('process');
var root = (process.env.FSD_COVERAGE) ? '../js_cov' : '../js';

var m2s = require(root + '/model2schema.js');

exports.testLoadModels = function (test) {
  var mdl = m2s.loadModel('node_modules/abot_testmodel/testmodel', 'cosmos');
  test.deepEqual(mdl.wordindex, [
    'object name',
    'object type',
    'orbits'
  ], 'load wordindex');
  test.done();
};


exports.testMakeMongoName = function (test) {
  test.equal(m2s.makeMongoName('abc def'),'abc_def');
  test.equal(m2s.makeMongoName('abc.def'),'abc_def');
  test.equal(m2s.makeMongoName('  .d$Ef'),'___d_Ef');
  test.done();
};


exports.testcalcMongoCatsOk = function (test) {
  test.deepEqual(m2s.calcMongoCats(['AB', 'C.D']), ['AB', 'C_D']);
  test.done();
};


exports.testcalcMongoCatsFail = function (test) {
  try {
    var res = m2s.calcMongoCats(['AB', 'C_D', 'C.D']);
    console.log(res);
    test.equal(1,0);
  } catch(e) {
    test.equals(e.toString(), 'Error: C_D and C.D yield conflicting mongodb property names');
  }
  test.done();
};


exports.testLoadModelsMakeSchemaData = function (test) {
  var mdl = m2s.loadModel('node_modules/abot_testmodel/testmodel', 'cosmos');
  var sd = m2s.mergeModelJson('cosmos',mdl);
  test.deepEqual(Object.keys(sd.props),
    ['object_name',
      'visual_magnitude',
      'visual_luminosity',
      'mass',
      'radius',
      'object_type',
      'orbits',
      'distance',
      '_url',
      'orbit_radius',
      'eccentricity',
      'orbital_period',
      'albedo',
      '_id']
  , 'props');

  test.deepEqual(sd.props['albedo'],
  { type: String, trim : true}, 'property value');

  test.deepEqual(sd.index,{
    'object_name' :  'text',
    'object_type' : 'text',
    'orbits' : 'text'
  }, 'index');
  test.done();
};

exports.testMapOne = function(test) {
  var res =  m2s.mapOne({ 'A B': 'abc', 'd f': 'axy' }, { 'A B': 'A_B', 'CDE' : 'CDE',
    'd f' : 'd_f'});
  test.deepEqual(res, {'A_B' : 'abc', 'd_f': 'axy'});
  test.done();
};

exports.testMakeModelData = function(test) {
  var mdl = m2s.loadModel('node_modules/abot_testmodel/testmodel', 'cosmos');
  m2s.mergeModelJson('cosmos',mdl);
  var mdldata = m2s.loadModelData('node_modules/abot_testmodel/testmodel', 'cosmos');
  var mdlDocs = m2s.makeDocuments(mdldata,mdl);
  test.deepEqual(mdlDocs[0], {
    object_name: 'Alpha Centauri A',
    visual_magnitude: '-0.27',
    visual_luminosity: '1.519*sun',
    mass: '1.1*sun',
    object_type: 'star',
    distance: '4.37 lightyears, 1.34pc',
    _id: 1
  });
  test.done();
};