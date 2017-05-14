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

import * as fs from 'fs';


import * as OM2MS from '../model2schema';
import * as mongoose from 'mongoose';

export function makeMongoName(s : string) : string {
  return s.replace(/[^a-zA-Z0-9]/g,'_');
}

export function loadModel(modelPath: string, sModelName: string) {
    debuglog(" loading " + sModelName + " ....");
    var oMdl = OM2MS.readFileAsJSON('./' + modelPath + '/' + sModelName + ".model.json") as fdevsta.IFModel.IModel;
    return oMdl;
    //mergeModelJson(sModelName, oMdl);
//    loadModelData(modelPath, oMdl, sModelName, oModel);
}


export function calcMongoCats(cats : string[]) : string[] {
  var props = {};
  var res = cats.map(cat => { var r = makeMongoName(cat);
      if(props[r]) {
        throw new Error(`${props[r]} and ${cat} yield conflicting mongodb property names`);
      }
      props[r] = cat;
      return r;
  });
  return res;
}

export function getTextIndexCategories(oMdl : IMatch.IModel) : string[] {
  return _.difference(oMdl.wordindex, oMdl.exactmatch);
}

export interface IQBEColumnProps {
        defaultWidth? : number,
            QBE : boolean
            QBEInclude : boolean,
            LUNRIndex : true
};


  export  interface ICatRecord {
        category : string,
        category_description? : string,
        category_synonyms? : string[],
        wordindex : boolean,
        exactmatch: boolean,
        hidden: true,
        QBEColumnProps? : IQBEColumnProps
    }

    export interface IModelDoc {
        domain: string,
        domain_description? : string,
        domain_synonyms? : string[],
        _categories : ICatRecord[],
        columns : string[]
    }

export function convertOModelToModelDoc(sModelName: string, oMdl : fdevsta.IFModel.IModel)  : IModelDoc {
    var categoryDescribedMap = {} as { [key: string]: IMatch.ICategoryDesc };
    oMdl.bitindex = 0; // getDomainBitIndex(oMdl.domain, oModel);
    oMdl.categoryDescribed = [];
    // rectify category
    oMdl.category = oMdl.category.map(function (cat: any) {
        if (typeof cat === "string") {
            return cat;
        }
        if (typeof cat.name !== "string") {
            console.log("Missing name in object typed category in " + JSON.stringify(cat) + " in model " + sModelName);
            process.exit(-1);
            //throw new Error('Domain ' + oMdl.domain + ' already loaded while loading ' + sModelName + '?');
        }
        categoryDescribedMap[cat.name] = cat;
        oMdl.categoryDescribed.push(cat);
        return cat.name;
    });

    var schema = new mongoose.Schema({ _id : Number});

    var props  = {};

    var mongoCategories = calcMongoCats(oMdl.category);
    mongoCategories.forEach(cat =>
      props[cat] = { type : String, trim : true }
    );
    oMdl.wordindex.forEach(rcat => {
      var cat = makeMongoName(rcat);
      if(!props[cat]) {
        console.error(`model : ${sModelName} wordindex category "${cat}" is not in categories?`);
        process.exit(-1);
       }
       props[cat].index = true;
    });

    oMdl.wordindex = oMdl.wordindex || [];
    oMdl.exactmatch = oMdl.exactmatch || [];
    // check that members of wordindex are in categories,
    oMdl.wordindex = oMdl.wordindex || [];
    oMdl.wordindex.forEach(function (sWordIndex) {
        if (oMdl.category.indexOf(sWordIndex) < 0) {
            throw new Error('Model wordindex "' + sWordIndex + '" not a category of domain ' + oMdl.domain + ' ');
        }
    });
    oMdl.exactmatch = oMdl.exactmatch || [];
    oMdl.exactmatch.forEach(function (sExactMatch) {
        if (oMdl.category.indexOf(sExactMatch) < 0) {
            throw new Error('Model exactmatch "' + sExactMatch + '" not a category of domain ' + oMdl.domain + ' ');
        }
    });
    oMdl.columns = oMdl.columns || [];
    oMdl.columns.forEach(function (sExactMatch) {
        if (oMdl.category.indexOf(sExactMatch) < 0) {
            throw new Error('Model column "' + sExactMatch + '" not a category of domain ' + oMdl.domain + ' ');
        }
    });

    var s = getTextIndexCategories(oMdl);
    var index = {};
    s.forEach(textIndexCat  => {
      index[makeMongoName(textIndexCat)] = 'text';
    })
    props["_id"] = { type : Number};

    var res = {
        domain : oMdl.domain,
        domain_description : oMdl.description || undefined,
        _categories : [],
        columns : oMdl.columns
    } as IModelDoc;

    if (oMdl.synonyms && oMdl.synonyms[oMdl.domain]) {
            res.domain_synonyms = oMdl.synonyms[oMdl.domain];
    }

    function assureQBEColumnProps(catRecord : ICatRecord) {
        catRecord.QBEColumnProps = catRecord.QBEColumnProps || {} as IQBEColumnProps;
    }

    res._categories = oMdl.category.map( cat => {
        var catRecord = {
        } as ICatRecord;
        catRecord.category = cat;
        catRecord.category_description = categoryDescribedMap && categoryDescribedMap[cat] && categoryDescribedMap[cat].description || undefined;
        if(oMdl.hidden.indexOf(cat) > 0) {
            catRecord.hidden = true
        }
        if(categoryDescribedMap && categoryDescribedMap[cat]) {
            var descr = categoryDescribedMap[cat] as any;
            if (descr.defaultWidth)
            {
                catRecord.QBEColumnProps = catRecord.QBEColumnProps || {} as IQBEColumnProps;
                catRecord.QBEColumnProps.defaultWidth = descr.defaultWidth;
            }
            if(descr.QBE) {
                assureQBEColumnProps(catRecord);
                catRecord.QBEColumnProps.QBE = true;
            }
            if(descr.QBEInclude) {
                assureQBEColumnProps(catRecord);
                catRecord.QBEColumnProps.QBEInclude = true;
            }
            if(descr.LUNRIndex) {
                assureQBEColumnProps(catRecord);
                catRecord.QBEColumnProps.LUNRIndex = true;
            }
        }
        if(oMdl.wordindex.indexOf(cat) > 0) {
            catRecord.wordindex = true
        }
        if(oMdl.exactmatch.indexOf(cat) > 0) {
            catRecord.exactmatch = true
        }
        if(oMdl.synonyms && oMdl.synonyms[cat]) {
            catRecord.category_synonyms = oMdl.synonyms[cat];
        }
        return catRecord;
    });
    return res;
}

export function mapOne(o : any, props : { [key : string ] : string}) : any {
  var res = {};
  Object.keys(props).forEach( key => {
    var val = o[key];
    if(o[key]!== undefined) {
      res[props[key]] = o[key];
    };
  });
  return res;
}

export function makeDocuments(data : any, oMdl : IMatch.IModel) : any {
  var props = {};
  oMdl.category.forEach(cat =>
    props[cat] = makeMongoName(cat)
  );
  return data.map( (o,index) =>  {
    var r = mapOne(o,props);
    r._id = index + 1;
    return r;
   });
}

/*
var modelpath = process.env.ABOT_MODELPATH || "node_modules/abot_testmodel/testmodel";

var models = readFileAsJSON(modelpath + "/models.json");

models.forEach(m => {
    var oMdl = loadModel(modelpath, m);
    var res = convertOModelToModelDoc(m,oMdl);
    var ms = JSON.stringify(res,undefined,2);
    console.log(ms);
    fs.writeFileSync(modelpath + "/" + m + ".model.doc.json", JSON.stringify(res,undefined,2));
});
*/

