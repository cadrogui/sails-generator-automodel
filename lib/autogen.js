/**
 * sails-generate-automodel
 *
 * @description library for database tables and associations handling
 */

var  _ = require('underscore'),
    _s = require('underscore.string'),
    fields = [],
    connection = "",
    config = "";

var _this = module.exports = {

    /*
      get all tables for the selected mysql connection
    */

    getTables: function(conn, fn){
      var tables = []

      conn.tables(function(err, table){
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

    getFields: function(table, conn, fn){
      var fields = []
      var key = {}

      conn.fields(table, function(err, field){
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

    getforeign: function(table, conn, fn){
      var foreigns = []
      var key = {}

      conn.foreign(table, function(err, foreign){
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

    generate: function(conn, fn){

      var tb = []
      var fields = [],
          foreigns = []

      _this.getTables(conn, function(tables){

        tables.forEach(function(e, i){

          _this.getFields(e.name, conn, function(field){
            fields.push(field)
          })

          _this.getforeign(e.name, conn, function(foreign){
            foreigns.push(foreign)
          })

        });

        setTimeout(function(){
          var tt = []

          tt.push(fields);
          tt.push(foreigns);

          fn(tt);

        }, 300)

        conn.end()
      })
    },

}
