module.exports = {
    "identity": "Empresas",
    "connection": "estivTesting",
    "autoCreatedAt": false,
    "autoUpdatedAt": false,
    "attributes": {
        "id": {
            "type": "INTEGER",
            "primaryKey": "TRUE"
        },
        "nombre": "STRING",
        "razon_social": "STRING",
        "rut": "STRING",
        "direccion": "STRING",
        "comuna": "STRING",
        "rubro": "STRING",
        "numero_trabajadores": "INTEGER",
        "createdAt": "DATE"
    }
}