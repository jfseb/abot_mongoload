'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// based on: http://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Levenshtein_distance
// and:  http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/test');
function doKittens() {
    var kittySchema = new mongoose.Schema({
        _id: Number,
        name: String
    }, { id: false });
    mongoose.Promise = global.Promise;
    var Kitten = mongoose.model('Kitten', kittySchema);
    var silence = new Kitten({ _id: 7, name: 'Silence' });
    console.log(silence.name); // 'Silence'
    var doc2 = new Kitten({ _id: 10, name: 'ACat' });
    silence.save(function (err, fluffy) {
        if (err)
            return console.error(err);
        //fluffy.speak();
    });
    doc2.save(function (err, fluffy) {
        if (err)
            return console.error(err);
        //fluffy.speak();
    });
    console.log(JSON.stringify(mongoose.model('Kitten').schema.get('name')));
    Kitten.find(function (err, kittens) {
        if (err)
            return console.error(err);
        console.log(kittens);
        kittens.forEach((kit, index) => {
            if (index === 0) {
                Kitten.findById(kit._id).then(fkit => fkit.remove().then(e => {
                    console.log('removed ' + kit._id);
                }).catch(err => console.log(err)));
            }
        });
    });
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('here model names : ' + db.modelNames());
    doKittens();
    console.log('now model names : ' + db.modelNames());
    console.log('done');
});

//# sourceMappingURL=index.js.map
