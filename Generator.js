/**
 * sails-generate-automodel
 *
 * Usage:
 * `sails generate automodel`
 *
 * @description Generates a model file from you database
 * @help See http://links.sailsjs.org/docs/generators
 */

var discover = require('./lib/discover.js'),
    autogen = require('./lib/autogen.js'),
    prompt = require('prompt'),
    _s = require('underscore.string'),
    ModelName = "",
    _u = require('underscore');

var util = require('util');
var _ = require('lodash');
_.defaults = require('merge-defaults');

module.exports = {

  before: function (scope, cb) {

    discover.connections(function(conn){

      prompt.message = "Use this connection? y/n".red;

      prompt.start();

      prompt.get(mysqlConnections, function (err, result) {

        var connection = discover.setConn();

        autogen.generate(connection, function(g){

          var ls = []
          var fields = g[0]
          var foreigns = g[1]
          var pp = {}

          for(var i = 0; i<fields.length; ++i){
            ls.push({ fields: fields[i], foreigns: foreigns[i] });
          }

          for(var i = 0; i<ls.length; ++i){

            var tablaName = _u.keys(ls[i].fields);
            var ModelName
            var name = _u.chain(ls[i].fields)
            .map(function(k,v){
              ModelName = _s.capitalize(v)
            })

            for(var f = 0; f<_.values(ls[i].fields).length; ++f){

              var attributes = {}
              var props = {}
              var type
              var tblsModel = []

              for(var v = 0; v < _u.values(ls[i].fields)[f].length; ++v){

                var element = _u.values(ls[i].fields)[f][v]

                switch(element.Type){
                  case 'datetime':
                    type = "DATE"
                  break;

                  case 'int(11)':
                    type = "INTEGER"
                  break;

                  default:
                    type = "STRING"
                  break;
                }

                props[element.name] = type

                if(element.name == 'id'){
                  props['id'] = { type: 'INTEGER', primaryKey: "TRUE" }
                }
              }

              /*
                relationship
              */

              var foreingKey

              for(var f = 0; f < _u.values(ls[i].foreigns).length; ++f){
                for(var c = 0; c < _u.values(ls[i].foreigns)[0].length; ++c){

                  foreingKey = _u.values(ls[i].foreigns)[0][c].columnName

                  // search foreign keys in properties model

                  for(var prop in props){
                    if(props.hasOwnProperty(prop)){
                      if(prop == foreingKey){

                        var referencedTable = _s.capitalize(_u.values(ls[i].foreigns)[0][c].model)

                        delete props[_u.values(ls[i].foreigns)[0][c].columnName]

                        props[referencedTable] = _u.values(ls[i].foreigns)[0][c]

                      }
                    }
                  }

                }
              }

              attributes = { identity: ModelName, connection: allConnectionsNames[selectedConnection],
                             autoCreatedAt: false,
                             autoUpdatedAt: false, attributes:  props  }

              var attrs = JSON.stringify(attributes, null, 4)

              _.defaults(scope, {
                createdAt: new Date(),
              });

              scope.modelName = ModelName
              scope.signature = 'Model created by AutoModel on '+scope.createdAt;
              scope.attrs = attrs

              scope.filename = './api/models/' + ModelName + '.js'

              cb();

            }

          }
        })

      })
    });

    if (!scope.rootPath) {
      return cb( INVALID_SCOPE_VARIABLE('rootPath') );
    }
  },

  /**
   * The files/folders to generate.
   * @type {Object}
   */

  targets: {
    './:filename': { template: 'template.js' },
  },

  templatesDirectory: require('path').resolve(__dirname, './templates')
};

/**
 * INVALID_SCOPE_VARIABLE()
 *
 * Helper method to put together a nice error about a missing or invalid
 * scope variable. We should always validate any required scope variables
 * to avoid inadvertently smashing someone's filesystem.
 *
 * @param {String} varname [the name of the missing/invalid scope variable]
 * @param {String} details [optional - additional details to display on the console]
 * @param {String} message [optional - override for the default message]
 * @return {Error}
 * @api private
 */

function INVALID_SCOPE_VARIABLE (varname, details, message) {
  var DEFAULT_MESSAGE =
  'Issue encountered in generator "automodel":\n'+
  'Missing required scope variable: `%s`"\n' +
  'If you are the author of `sails-generate-automodel`, please resolve this '+
  'issue and publish a new patch release.';

  message = (message || DEFAULT_MESSAGE) + (details ? '\n'+details : '');
  message = util.inspect(message, varname);

  return new Error(message);
}
