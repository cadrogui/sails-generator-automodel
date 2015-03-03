/**
 * sails-generate-automodel
 *
 * @description Library for discover mysql databases and connections
 */

var config = require('../../config/connections'),
    mysql = require('mysql')
    mysqlUtilities = require('mysql-utilities'),
    fs = require('fs'),
    connections = [config.connections],
    allConnections = [],
    allConnectionsNames = [],
    mysqlConnections = [],
    selectedConnection = "",
    util = require('util');


module.exports = {

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

      try{
        connection = mysql.createConnection({
          host     : allConnections[selectedConnection].host,
          user     : allConnections[selectedConnection].user,
          password : allConnections[selectedConnection].password,
          database : allConnections[selectedConnection].database
        });

        mysqlUtilities.upgrade(connection);
        mysqlUtilities.introspection(connection);

        connection.connect();

        return connection;
      }catch(e){
        console.error("Ups, seems to you dont have any Mysql connections")
        return false
      }
    },

};
