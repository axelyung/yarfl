import { StateWithForms } from 'es/types';
import {
    Config,
    } from 'src/types';

type TestState = {
    field1: {
        nestedfield1: string,
        nestedField2: number,
    }[],
};

export const arrayConfig: Config<TestState> = {
    name: 'arrayForm',
    fields: {
        field1: {
            multiple: true,
            fields: {
                nestedField1: {
                    value: 'value',
                    default: 'default value',
                },
                nestedField2: {
                    type: 'number',
                    value: 18,
                },
            },
        },
    },
};

export const arrayState: StateWithForms = {
    arrayForm: {
        action: '',
        name: 'arrayForm',
        method: 'POST',
        isAsync: false,
        fields: {
            field1: {
                key: 'field1',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                fieldType: 'ARRAY',
                default: {
                    nestedField1: {
                        default: 'default value',
                        initial: 'value',
                        autoComplete: 'nestedField1',
                        showErrors: false,
                        autoFocus: false,
                        name: 'nestedField1',
                        errors: [],
                        value: 'value',
                        placeholder: 'Nested Field 1',
                        changed: false,
                        label: 'Nested Field 1',
                        fieldType: 'SIMPLE',
                        rules: '',
                        focused: false,
                        type: 'text',
                        id: 'nested-field-1',
                        disabled: false,
                        touched: false,
                        key: 'nestedField1',
                    },
                    nestedField2: {
                        default: '',
                        initial: 18,
                        autoComplete: 'nestedField2',
                        showErrors: false,
                        autoFocus: false,
                        name: 'nestedField2',
                        errors: [],
                        value: 18,
                        placeholder: 'Nested Field 2',
                        changed: false,
                        label: 'Nested Field 2',
                        fieldType: 'SIMPLE',
                        rules: '',
                        focused: false,
                        type: 'number',
                        id: 'nested-field-2',
                        disabled: false,
                        touched: false,
                        key: 'nestedField2',
                    },
                },
                fields: [
                    {
                        nestedField1: {
                            default: 'default value',
                            initial: 'value',
                            autoComplete: 'nestedField1',
                            showErrors: false,
                            autoFocus: false,
                            name: 'field1[][nestedField1]',
                            errors: [],
                            value: 'value',
                            placeholder: 'Nested Field 1',
                            changed: false,
                            label: 'Nested Field 1',
                            fieldType: 'SIMPLE',
                            rules: '',
                            focused: false,
                            type: 'text',
                            id: 'nested-field-1-0',
                            disabled: false,
                            touched: false,
                            key: 'nestedField1[0]',
                        },
                        nestedField2: {
                            default: '',
                            initial: 18,
                            autoComplete: 'nestedField2',
                            showErrors: false,
                            autoFocus: false,
                            name: 'field1[][nestedField2]',
                            errors: [],
                            value: 18,
                            placeholder: 'Nested Field 2',
                            changed: false,
                            label: 'Nested Field 2',
                            fieldType: 'SIMPLE',
                            rules: '',
                            focused: false,
                            type: 'number',
                            id: 'nested-field-2-0',
                            disabled: false,
                            touched: false,
                            key: 'nestedField2[0]',
                        },
                    },
                ],
            },
        },
    },
};