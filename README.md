# abot_mongoload [![Build Status](https://travis-ci.org/jfseb/abot_nomgoload.svg?branch=master)](https://travis-ci.org/jfseb/abot_mongoload)[![Coverage Status](https://coveralls.io/repos/github/jfseb/abot_mongoload/badge.svg)](https://coveralls.io/github/jfseb/abot_mongoload)

node code to load a model into mongodb

>
> npm i
> gulp
usage:
> npm run migrateOModel2MGModel
>


Environment variable ABOT_MODELPATH may be set to a valid model
    (default is node_modules/testmodel)

Environmenet variable ABOT_MONGODBNAME may be set to a valid mongodb name
   (default is testmodel);

The default database is testmodel

this unit contains conversion routines to migrate the Old model (OModel) to a mongo based schema



