# Sails Generator Automodel
#### Generate models automatically for Sails Js or Waterline for Mysql connections
One bad thing when you work with sails js is do all the models by hand... until now, this generator helps to do this task in a very simple way.

At this moment the geenrator is not complete, but the code to create the models is done, if you want to use you must clone in the node_modules folder in your sails app, and run like this:

```
#node index.js
```

Automodel will find all conections that use sails-mysql adapter, and will prompt for usage.... and tahts all, automodel will generate all files for represent you database.

#### Relationships
Automodel detects all the foreign keys and try to create the relations, but is not 100% efective, with automodel you get like this
```
module.exports = {
    "identity": "Evaluaciones",
    "connection": "estivTesting",
    "autoCreatedAt": false,
    "autoUpdatedAt": false,
    "attributes": {
        "id": {
            "type": "INTEGER",
            "primaryKey": "TRUE"
        },
        "createdAt": "DATE",
        "Trabajadores": {
            "model": "Trabajadores",
            "columnName": "trabajador_id"
        },
        "Usuarios": {
            "model": "Usuarios",
            "columnName": "usuario_id"
        },
    }
}
```

As you can see automodel helps a lot with the tedious task of creating the models.
