import { Config, StateWithForms } from 'src/typings';

type ShallowState = {
    field1: string,
    field2: number,
};

export const shallowConfig: Config<ShallowState> = {
    name: 'basicForm',
    action: 'http://api.com/endpoint',
    fields: {
        field1: {
            value: '',
            default: 'default value',
            rules: 'required',
            id: 'field_1',
            type: 'text',
            label: 'Field 1',
            placeholder: 'Field One',
            autoFocus: false,
        },
        field2: {
            default: 1,
        },
    },
};

export const shallowState: StateWithForms = {
    basicForm: {
        action: 'http://api.com/endpoint',
        name: 'basicForm',
        method: 'POST',
        fields: {
            field1: {
                key: 'field1',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                extra: {},
                fieldType: 'SIMPLE',
                value: '',
                default: 'default value',
                initial: '',
                rules: 'required',
                name: 'field1',
                id: 'field_1',
                type: 'text',
                label: 'Field 1',
                placeholder: 'Field One',
                disabled: false,
                autoFocus: false,
                autoComplete: 'field1',
                errors: [
                    'The field 1 field is required.',
                ],
            },
            field2: {
                key: 'field2',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                extra: {},
                fieldType: 'SIMPLE',
                value: 1,
                default: 1,
                initial: 1,
                rules: '',
                name: 'field2',
                id: 'field-2',
                type: 'number',
                label: 'Field 2',
                placeholder: 'Field 2',
                disabled: false,
                autoFocus: false,
                autoComplete: 'field2',
                errors: [],
            },
        },
        isAsync: false,
        extra: {},
    },
};