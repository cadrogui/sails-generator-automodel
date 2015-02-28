var config = require('../../config/connections'),
    _ = require('underscore'),
    _s = require('underscore.string'),
    mysql = require('mysql')
    mysqlUtilities = require('mysql-utilities'),
    fs = require('fs'),
    connections = [config.connections],
    allConnections = [],
    allConnectionsNames = [],
    mysqlConnections = [],
    selectedConnection = "",
    prompt = require('prompt'),
    fields = [],
    connection = "";

var discover = {

  /*
    discover all connections in sails connections file
  */

  connections: function(fn){

    for (var key in connections) {
       var obj = connections[key];

       for (var prop in obj) {

          if(obj.hasOwnProperty(prop)){

            allConnectionsNames.push(prop);

            allConnections.push(obj[prop])
          }
       }
    }

    allConnections.forEach(function(e,i){

      if(allConnections[i].adapter != 'sails-mysql'){

        delete allConnections[i]
        delete allConnectionsNames[i]

      }else if(allConnections[i].adapter == 'sails-mysql'){

        mysqlConnections.push({ name: allConnectionsNames[i],

          before: function(value) {
            if(value == 'y'){

              selectedConnection = allConnectionsNames.indexOf(allConnectionsNames[i])

              return true

            }else{

              return false
            }
          }
        })
      }

    });

    fn(allConnections)
  },

  /*
    connect to mysql
  */

  setConn: function(){
    connection = mysql.createConnection({
      host     : allConnections[selectedConnection].host,
      user     : allConnections[selectedConnection].user,
      password : allConnections[selectedConnection].password,
      database : allConnections[selectedConnection].database
    });

    mysqlUtilities.upgrade(connection);
    mysqlUtilities.introspection(connection);

    connection.connect();
  }
};


var autogen = {

  /*
    get all tables for the selected mysql connection
  */

  getTables: function(fn){
    var tables = []

    connection.tables(function(err, table){
      _.chain(table)
      .map(function(k, v){
        tables.push({ name: v})
      })

      fn(tables)
    })
  },

  /*
    get all fields for all tables in mysql connection
  */

  getFields: function(table, fn){
    var fields = []
    var key = {}

    connection.fields(table, function(err, field){
      _.chain(field)
      .map(function(k, v){

        fields.push({ name: v, Type: k.Type });

        key[table] = fields
      })

      fn(key)
    });
  },

  /*
    get all foreign keys for all tables
  */

  getforeign: function(table, fn){
    var foreigns = []
    var key = {}

    connection.foreign(table, function(err, foreign){
      _.chain(foreign)
      .map(function(k, v){
        // foreigns.push({ constrain: k.CONSTRAINT_NAME, referenced_table: k.REFERENCED_TABLE_NAME,
        //   referenced_column_name: k.REFERENCED_COLUMN_NAME, columnName: k.COLUMN_NAME})

        foreigns.push({ model: _s.capitalize(k.REFERENCED_TABLE_NAME), columnName: k.COLUMN_NAME})

        key[table] = foreigns
      })

      fn(key)
    })

  },

  /*
    generate the models
  */

  generate: function(fn){

    var tb = []
    var fields = [],
        foreigns = []

    autogen.getTables(function(tables){

      tables.forEach(function(e, i){

        autogen.getFields(e.name, function(field){
          fields.push(field)
        })

        autogen.getforeign(e.name, function(foreign){
          foreigns.push(foreign)
        })

      });

      setTimeout(function(){
        var tt = []

        tt.push(fields);
        tt.push(foreigns);

        fn(tt);

      }, 300)

      connection.end()
    })
  },

};

/*
  init discover mysql connections and process tables
*/

discover.connections(function(conn){

  prompt.message = "Use this connection? y/n".red;

  prompt.start();

  prompt.get(mysqlConnections, function (err, result) {

    discover.setConn();

    autogen.generate(function(g){

      var ls = []
      var fields = g[0]
      var foreigns = g[1]
      var pp = {}

      for(var i = 0; i<fields.length; ++i){
        ls.push({ fields: fields[i], foreigns: foreigns[i] });
      }

      for(var i = 0; i<ls.length; ++i){

        var tablaName = _.keys(ls[i].fields);
        var ModelName

        var name = _.chain(ls[i].fields)
        .map(function(k,v){
          ModelName = _s.capitalize(v)
        })

        for(var f = 0; f<_.values(ls[i].fields).length; ++f){

          var attributes = {}
          var props = {}
          var type
          var tblsModel = []

          for(var v = 0; v<_.values(ls[i].fields)[f].length; ++v){

            var element = _.values(ls[i].fields)[f][v]

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

          for(var f = 0; f<_.values(ls[i].foreigns).length; ++f){
            for(var c = 0; c<_.values(ls[i].foreigns)[0].length; ++c){

              foreingKey = _.values(ls[i].foreigns)[0][c].columnName

              // search foreign keys in properties model

              for(var prop in props){
                if(props.hasOwnProperty(prop)){
                  if(prop == foreingKey){

                    var referencedTable = _s.capitalize(_.values(ls[i].foreigns)[0][c].model)

                    delete props[_.values(ls[i].foreigns)[0][c].columnName]

                    props[referencedTable] = _.values(ls[i].foreigns)[0][c]

                  }
                }
              }

            }
          }

          attributes = { identity: ModelName, connection: allConnectionsNames[selectedConnection],
                         autoCreatedAt: false,
                         autoUpdatedAt: false, attributes:  props  }

          var attrs = JSON.stringify(attributes, null, 4)
          md = "module.exports = " + attrs

          console.log("Writing Model " + ModelName);

          fs.writeFile(ModelName + '.js', md, function (err) {

            if (err) {
              return console.log(err);
            }

            Object.keys(attributes).length = 0
            Object.keys(props).length = 0

          });

        }

      }
    })

  })
});
