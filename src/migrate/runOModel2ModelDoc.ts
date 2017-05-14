'use strict'

/**
 * (C) gerd forstmann 2017
 *
 * convert (old) model file to a new model data document
 */

//import * as intf from 'constants';
import * as debug from 'debug';
import * as _ from 'lodash';

import { IFModel  as IMatch } from 'fdevsta_monmove';

import *  as fdevsta from 'fdevsta_monmove';

var IFModel = fdevsta.IFModel;

var debuglog = debug('model');

import * as Om2MD from './oModel2ModelDoc';
import * as Om2MS from '../model2schema';

var modelpath = process.env.ABOT_MODELPATH || "node_modules/abot_testmodel/testmodel";

var models = Om2MS.readFileAsJSON(modelpath + "/models.json");

import * as fs from 'fs';

models.forEach(m => {
    var oMdl = Om2MD.loadModel(modelpath, m);

    var res = Om2MD.convertOModelToModelDoc(m,oMdl);
    var ms = JSON.stringify(res,undefined,2);
    console.log(ms);
    fs.writeFileSync(modelpath + "/" + m + ".model.doc.json", JSON.stringify(res,undefined,2));

    var oMdl = Om2MD.loadModel(modelpath, m);
    var resSchema = Om2MS.mergeModelJson(m,oMdl) ;
    var sResSchema = Om2MS.serializeMS(resSchema);
    console.log(JSON.stringify(resSchema, function(key,value) {
        if(key === "type") {
            if(value === String) {
                return "String"
            };
        }
        return value;
    }, 2));
    fs.writeFileSync(modelpath + "/" + m + ".model.mongooseschema.json", sResSchema);
});

