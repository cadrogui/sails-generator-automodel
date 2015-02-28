module.exports = {
    "identity": "Usuarios",
    "connection": "estivTesting",
    "autoCreatedAt": false,
    "autoUpdatedAt": false,
    "attributes": {
        "id": {
            "type": "INTEGER",
            "primaryKey": "TRUE"
        },
        "nombre": "STRING",
        "apellido": "STRING",
        "email": "STRING",
        "usuario": "STRING",
        "password": "STRING",
        "createdAt": "DATE",
        "Roles": {
            "model": "Roles",
            "columnName": "rol_id"
        }
    }
}