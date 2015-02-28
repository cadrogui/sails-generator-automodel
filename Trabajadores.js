module.exports = {
    "identity": "Trabajadores",
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
        "rut": "STRING",
        "createdAt": "DATE",
        "Empresas": {
            "model": "Empresas",
            "columnName": "empresa_id"
        },
        "Puestos_trabajo": {
            "model": "Puestos_trabajo",
            "columnName": "puesto_trabajo_id"
        },
        "Turnos": {
            "model": "Turnos",
            "columnName": "turno_id"
        }
    }
}