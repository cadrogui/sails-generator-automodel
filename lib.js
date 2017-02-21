var mysql = require('mysql')
var mysqlUtilities = require('mysql-utilities')
var Promise = require('bluebird')
var _ = require('underscore')
var _s = require('underscore.string')
var async = require('async')
var fs = require('fs')
var prompt = require('prompt')
var _template

var connection

var MysqlAutogen = function(){
  fs.readFile(__dirname + '/template.js', function(err, file){
    if(!err){
      _template = file
    }else{
      console.log(err)
      process.exit(1)
    }
  })
}

MysqlAutogen.prototype.getDBVars = function(){
  return new Promise(function(resolve, reject){
    prompt.start();
    prompt.get(['host', 'user', 'password', 'database'], function (err, result) {
      for(var key in result){
        if(result[key] == ''){
          reject(new TypeError('The field ' + key + ' cannot be empty'))
        }else{
          connection = mysql.createConnection({
            host:     result.host,
            user:     result.user,
            password: result.password,
            database: result.database
          });

          mysqlUtilities.upgrade(connection)
          mysqlUtilities.introspection(connection)

          connection.connect()
          resolve()
        }
      }
    });
  })
}

MysqlAutogen.prototype.getTables = function(){
  return new Promise(function(resolve, reject){
    var _tables = []

    connection.tables(function(err, tables){
      if(!err){
        _.chain(tables)
        .map(function(k, v){
          _tables.push({ name: v})
        })

        resolve(_tables)
      }else{
        reject(err)
      }
    })
  })
}

MysqlAutogen.prototype.getFields = function(table){
  return new Promise(function(resolve, reject){
    var _fields = []
    var _key = {}

    connection.fields(table.name, function(err, fields){
      if(!err){
        _.chain(fields)
        .map(function(k, v){
          _fields.push({ name: v, Type: k.Type })
          _key[table.name] = _fields
        })

        resolve(_key)

      }else{
        reject(err)
      }
    })
  })
}

MysqlAutogen.prototype.getforeign = function(table){
  return new Promise(function(resolve, reject){
    var _foreigns = []
    var _key = {}

    connection.foreign(table.name, function(err, fields){
      if(!err){
        _.chain(fields)
        .map(function(k, v){
          _foreigns.push({ model: _s.capitalize(k.REFERENCED_TABLE_NAME), columnName: k.COLUMN_NAME})
          _key[table] = _foreigns
        })

        resolve(_key)
      }else{
        reject(err)
      }
    })
  })
}

MysqlAutogen.prototype.dataType = function(type){
  type = type.match(/([A-Za-z])\w+/g)[0]

  switch(type){
    case 'varchar':
    type = "STRING"
    break;

    case 'text':
    type = 'TEXT'
    break;

    case 'int':
    type = "INTEGER"
    break;

    case 'tinyint':
    type = 'FLOAT'
    break;

    case 'date':
    type = "DATE"
    break;

    case 'time':
    type = "TIME"
    break;

    case 'datetime':
    type = "DATETIME"
    break;

    case 'boolean':
    type = "BOOLEAN"
    break;

    case 'binary':
    type = "BINARY"
    break;

    case 'aray':
    type = "ARRAY"
    break;

    case 'json':
    type = "JSON"
    break;
  }

  return type
}

MysqlAutogen.prototype.generate = function(){
  var self = this

  return new Promise(function(resolve, reject){
    var _fields = []
    var _foreigns = []
    var _model = []
    var _promisesFields = []
    var _promisesForeigns = []

    MysqlAutogen.prototype.getTables()
    .then((tables) => {

      async.waterfall([
        function(next) {
          tables.forEach(function(e){
            _promisesFields.push(MysqlAutogen.prototype.getFields(e))
            _promisesForeigns.push(MysqlAutogen.prototype.getforeign(e))
          })
          next(null, _promisesFields, _promisesForeigns)
        },
        function(_promisesFields, _promisesForeigns, next) {
          Promise.all(_promisesFields)
          .then((fields) => {
            next(null, fields, _promisesForeigns)
          })
          .catch((err) => {
            next(err, null)
          })
        },
        function(fields, _promisesForeigns, next){
          Promise.all(_promisesForeigns)
          .then((foreigns) => {
            next(null, fields, foreigns)
          })
          .catch((err) => {
            next(err, null)
          })
        },
        function(_fields, _foreigns, next) {
          next(null, {
            fields: _fields,
            foreigns: _foreigns
          })
        },
        function(_model, next){
          var model = []

          for(var i = 0; i < _model.fields.length; ++i){
            model.push({ fields: _model.fields[i], foreigns: _model.foreigns[i] });
          }

          next(null, model)
        },
        function(_models, next){
          var models = []

          for(var i = 0; i < _models.length; i++){
            var tablaName = _.keys(_models[i].fields);
            var ModelName

            var name = _.chain(_models[i].fields)
            .map(function(k,v){
              ModelName = _s.capitalize(v)
            })

            for(var f = 0; f < _.values(_models[i].fields).length; ++f){
              var attributes = {}
              var props = {}
              var type
              var tblsModel = []

              for(var v = 0; v < _.values(_models[i].fields)[f].length; ++v){
                var element = _.values(_models[i].fields)[f][v]

                props[element.name] = MysqlAutogen.prototype.dataType(element.Type)

                if(element.name == 'id'){
                  props['id'] = {
                    type: 'INTEGER',
                    primaryKey: "true",
                    autoIncrement: "true"
                  }
                }
              }

              /*
                relationship
              */

              var foreingKey

              for(var fc = 0; fc < _.values(_models[i].foreigns).length; ++fc){
                for(var c = 0; c < _.values(_models[i].foreigns)[0].length; ++c){
                  foreingKey = _.values(_models[i].foreigns)[0][c].columnName

                  for(var prop in props){
                    if(props.hasOwnProperty(prop)){
                      if(prop == foreingKey){
                        var referencedTable = _s.capitalize(_.values(_models[i].foreigns)[0][c].model)

                        delete props[_.values(_models[i].foreigns)[0][c].columnName]

                        props[referencedTable] = _.values(_models[i].foreigns)[0][c]
                      }
                    }
                  }

                }
              }

              attributes = {
                identity: ModelName,
                connection: '',
                autoCreatedAt: false,
                autoUpdatedAt: false,
                attributes:  props
              }

              models.push(attributes)
            }
          }

          next(null, models)
        },
      ], function (err, model) {
        if(!err){
          resolve(model)
        }else{
          reject(err)
        }
      });

    })

  })

}

MysqlAutogen.prototype.writeFiles = function(models){
  return new Promise(function(resolve, reject){
    var _models = []
    var _promises = []

    models.forEach(function(m){
      var attrs = JSON.stringify(m, null, 4)
      var tpl = _.template(_template.toString())

      var _text = tpl({
        modelName: m.identity,
        signature: 'Model created by Sails Mysql Autogen on ' + new Date(),
        repoUrl: 'Gitgub Repo URL: https://github.com/cadrogui/sails-generator-automodel',
        attrs: attrs
      })

      _models.push(m.identity)
      _promises.push(fs.writeFile(process.cwd() + '/' + m.identity + '.js', _text))
    })

    Promise.all(_promises)
    .then((files) => {
      connection.end()
      resolve({ models: _models })
    })
    .catch((err) => {
      reject(err)
    })
  })
}

module.exports = new MysqlAutogen()
return module.exports
