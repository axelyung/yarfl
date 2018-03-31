import {
    Config,
    StateWithForms,
    } from 'src/types';

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
        isAsync: false,
        method: 'POST',
        fields: {
            field1: {
                default: 'default value',
                initial: '',
                autoComplete: 'field1',
                showErrors: false,
                autoFocus: false,
                name: 'field1',
                errors: [],
                value: '',
                placeholder: 'Field One',
                changed: false,
                label: 'Field 1',
                fieldType: 'SIMPLE',
                rules: 'required',
                focused: false,
                type: 'text',
                id: 'field_1',
                disabled: false,
                touched: false,
                key: 'field1',
            },
            field2: {
                default: 1,
                initial: 1,
                autoComplete: 'field2',
                showErrors: false,
                autoFocus: false,
                name: 'field2',
                errors: [],
                value: 1,
                placeholder: 'Field 2',
                changed: false,
                label: 'Field 2',
                fieldType: 'SIMPLE',
                rules: '',
                focused: false,
                type: 'number',
                id: 'field-2',
                disabled: false,
                touched: false,
                key: 'field2',
            },
        },
    },
};