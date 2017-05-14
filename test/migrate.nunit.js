
var process = require('process');
var root = (process.env.FSD_COVERAGE) ? '../js_cov' : '../js';
var Om2MS = require(root + '/model2schema.js');
var Om2MD = require(root + '/migrate/oModel2ModelDoc.js');

var fs = require('fs');

exports.testMigrateOm2MD = function (test) {
  var oMdl = Om2MD.loadModel('test/testdata/', 'bom');
  var m = 'bom';
  var res = Om2MD.convertOModelToModelDoc(m,oMdl);
  var ms = JSON.stringify(res,undefined,2);
  var expected = '' + fs.readFileSync('test/testdata/bom.model.doc.json');
  console.log(ms.substr(0,200));
  console.log(expected.substr(0,200));
  test.deepEqual(ms,expected);
  test.done();
};

exports.testMigrateOm2MS = function (test) {
  var oMdl = Om2MD.loadModel('test/testdata/', 'bom');
  var m = 'bom';
  var resSchema = Om2MS.mergeModelJson(m,oMdl) ;
  var sResSchema = Om2MS.serializeMS(resSchema);

  var expected = '' + fs.readFileSync('test/testdata/bom.model.mongooseschema.json');
  console.log(sResSchema.substr(0,200));
  console.log(expected.substr(0,200));
  test.deepEqual(sResSchema,expected);
  test.done();
};

