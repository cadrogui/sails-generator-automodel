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
        }
    }
}