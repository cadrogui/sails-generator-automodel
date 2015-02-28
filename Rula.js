module.exports = {
    "identity": "Rula",
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