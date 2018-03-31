const createTypeKey = (key: string) => `@@REDUX_VALIDATED/${key}`;

export const types = {
    FORM_UPDATE: createTypeKey('FORM_UPDATE'),
    FORM_CLEAR: createTypeKey('FORM_CLEAR'),
    FORM_RESET: createTypeKey('FORM_RESET'),
    FORM_VALIDATE: createTypeKey('FORM_VALIDATE'),
    FORM_SHOW_ERRORS: createTypeKey('FORM_SHOW_ERRORS'),

    NODE_UPDATE: createTypeKey('NODE_UPDATE'),
    NODE_CLEAR: createTypeKey('NODE_CLEAR'),
    NODE_RESET: createTypeKey('NODE_RESET'),
    NODE_VALIDATE: createTypeKey('NODE_VALIDATE'),
    NODE_SHOW_ERRORS: createTypeKey('NODE_SHOW_ERRORS'),

    FIELD_UPDATE: createTypeKey('FIELD_UPDATE'),
    FIELD_FOCUSED: createTypeKey('FIELD_FOCUSED'),
    FIELD_BLURRED: createTypeKey('FIELD_BLURRED'),
    FIELD_CLEAR: createTypeKey('FIELD_CLEAR'),
    FIELD_RESET: createTypeKey('FIELD_RESET'),
    FIELD_VALIDATE: createTypeKey('FIELD_VALIDATE'),
    FIELD_SHOW_ERRORS: createTypeKey('FIELD_SHOW_ERRORS'),

    ARRAY_FIELD_ADD: createTypeKey('ARRAY_FIELD_ADD'),
    ARRAY_FIELD_DELETE: createTypeKey('ARRAY_FIELD_DELETE'),
};