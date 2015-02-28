module.exports = {
    "identity": "Reba",
    "connection": "estivTesting",
    "autoCreatedAt": false,
    "autoUpdatedAt": false,
    "attributes": {
        "id": {
            "type": "INTEGER",
            "primaryKey": "TRUE"
        },
        "Evaluaciones": {
            "model": "Evaluaciones",
            "columnName": "evaluacion_id"
        }
    }
}