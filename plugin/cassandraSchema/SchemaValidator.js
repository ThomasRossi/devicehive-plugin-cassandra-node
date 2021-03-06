const SchemaError = require('./SchemaError');

class SchemaValidator {
    static getSchemasErrors(tableSchemas) {
        const errors = [];

        for (const tableName in tableSchemas) {
            if (tableSchemas.hasOwnProperty(tableName)) {
                const err = SchemaValidator.getSchemaError(tableSchemas[tableName], tableName);

                if (err) {
                    errors.push(err);
                }
            }
        }

        return errors;
    }

    static getSchemaError(tableSchema, tableName) {
        const paramsValid = SchemaValidator._validateParametersField(tableSchema);
        return paramsValid ? null : SchemaError.parametersError(tableName);
    }

    static _validateParametersField(tableSchema) {
        if (tableSchema.parameters) {
            const isNotString = SchemaValidator._parametersIsNotString(tableSchema.parameters);
            const isNotMap = SchemaValidator._parametersIsNotMap(tableSchema.parameters);
            const isNotUDT = SchemaValidator._parametersIsNotUDT(tableSchema.parameters);

            if (isNotString && isNotMap && isNotUDT) {
                return false;
            }
        }

        return true;
    }

    static _parametersIsNotString(type) {
        return !SchemaValidator._allowedPrimitiveParametersTypes.includes(type);
    }

    static _parametersIsNotMap(type) {
        const mapOfStringsPattern = /(frozen<)?map<(text|ascii|varchar),\s?(text|ascii|varchar)>>?/i;
        return !type.match(mapOfStringsPattern);
    }

    static _parametersIsNotUDT(type) {
        return SchemaValidator._notAllowedParametersTypes.some(t => {
            const primitiveTypePattern = new RegExp(`<(\\w+\\,\\s?)?${t}(\\,\\s?\\w+)?>`, 'i');
            const complexTypePattern = new RegExp(`${t}<[\\w\\,]*>`);

            const isPrimitive = Boolean(type.match(primitiveTypePattern));
            const isComplex = Boolean(type.match(complexTypePattern));

            return type === t || isPrimitive || isComplex;
        });
    }

    static get _notAllowedParametersTypes() {
        return SchemaValidator._cassandraTypes.filter(t => !SchemaValidator._allowedParametersTypes.includes(t));
    }

    static get _allowedParametersTypes() {
        return SchemaValidator._allowedPrimitiveParametersTypes.concat([ 'map' ]);
    }

    static get _allowedPrimitiveParametersTypes() {
        return [
            'text',
            'ascii',
            'varchar'
        ];
    }

    static get _cassandraTypes() {
        return [
            'ascii',
            'bigint',
            'blob',
            'boolean',
            'counter',
            'decimal',
            'double',
            'float',
            'int',
            'text',
            'timestamp',
            'uuid',
            'varchar',
            'varint',
            'timeuuid',
            'inet',
            'date',
            'time',
            'smallint',
            'tinyint',
            'list',
            'map',
            'set',
            'udt',
            'tuple'
        ];
    }
}

module.exports = SchemaValidator;