'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// based on: http://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Levenshtein_distance
// and:  http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
const mongoose = require("mongoose");
const m2s = require("./model2schema.js");
mongoose.connect('mongodb://localhost/testmodel');
var modelpath = process.env.ABOT_MODELPATH || "node_modules/abot_testmodel/testmodel";
var models = m2s.readFileAsJSON(modelpath + "/models.json");
mongoose.Promise = global.Promise;
function deleteAll(model) {
    return model.collection.drop();
}
function readOneModel(sModelName) {
    var mdl = m2s.loadModel(modelpath, sModelName);
    var res = m2s.mergeModelJson(sModelName, mdl);
    var mdldata = m2s.loadModelData(modelpath, sModelName);
    var mdlDocs = m2s.makeDocuments(mdldata, mdl);
    var schema = new mongoose.Schema(res.props);
    schema.index(res.index);
    var mongodomainname = m2s.makeMongoName(mdl.domain);
    var model = mongoose.model(mongodomainname, schema);
    var cnt = 0;
    return deleteAll(model).catch(err => console.log("could not delete " + mongodomainname))
        .then(a => {
        var aPromises = mdlDocs.map(doc => {
            var oDoc = new model(doc);
            return oDoc.save().then(a => { ++cnt; }).catch(err => console.log("error inserting " + err + "  inserting : " + JSON.stringify(doc) + ""));
        });
        return Promise.all(aPromises);
        //  return global.Promise.prototype.all(aPromises);
    }).then(a => {
        console.log(`inserted ${cnt} documents for domain ${mongodomainname}`);
    }).catch(err => {
        console.log(`error inserting documents for domain ${mongodomainname}`);
    });
}
/*
  var Kitten = mongoose.model('Kitten', kittySchema);

  var silence = new Kitten({ _id : 7, name: 'Silence' }) as any;
  console.log(silence.name); // 'Silence'

  var doc2 = new Kitten({ _id : 10, name: 'ACat' }) as any;

  silence.save(function (err, fluffy) {
    if (err) return console.error(err);
    //fluffy.speak();
  });

  doc2.save(function (err, fluffy) {
    if (err) return console.error(err);
    //fluffy.speak();
  });

  type TKitten = {
    _id: String,
    name: String
  };

  console.log(JSON.stringify(mongoose.model('Kitten').schema.get('name')));

  Kitten.find(function (err, kittens: TKitten[]) {
    if (err) return console.error(err);
    console.log(kittens);
    kittens.forEach((kit, index) => {
      if (index === 0) {
        Kitten.findById(kit._id).then(fkit =>
          fkit.remove().then(
            e => {
              console.log('removed ' + kit._id);
            }
          ).catch(err => console.log(err)));
      }
    });
  });
}
*/
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('here model names : ' + db.modelNames());
    //readOneModel(models[0]);
    Promise.all(models.map(mdl => readOneModel(mdl)))
        .then(a => {
        console.log("insertead all models");
        db.close();
    });
    console.log('now model names : ' + db.modelNames());
    console.log('done');
});

//# sourceMappingURL=loadmodel.js.map
