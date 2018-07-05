import {
    Config,
    // StateWithForms,
    } from 'src/types';

type ConfigType = {
    basicField: string,
    parent: {
        child1: string,
        child2: {
            grandchild1: string,
            grandchild2: number,
        },
    },
    arrayField: {
        multiple: true,
        fields: {
            arrayField1: {
                value: 'value',
                default: 'default',
            },
            arrayField2: {
                type: 'number',
                value: 18,
            },
        },
    },
};

export const config: Config<ConfigType> = {
    name: 'myForm',
    action: 'http://api.com/endpoint',
    customRules: [{
        name: 'password',
        message: `Password cannot be 'password'!`,
        // tslint:disable-next-line:variable-name
        callback: (value: any, _req: any, _attr: string) => {
            return value !== 'password';
        },
    }],
    fields: {
        basicField: {
            value: '',
            default: 'default value',
            rules: 'required|password',
            id: 'field_1',
            type: 'text',
            label: 'Field 1',
            placeholder: 'Field One',
            autoFocus: false,
        },
        parent: {
            fields: {
                child1: {
                    rules: 'required',
                },
                child2: {
                    fields: {
                        grandchild1: {
                            default: 'default',
                            rules: 'email',
                        },
                        grandchild2: {
                            type: 'number',
                        },
                    },
                },
            },
        },
        arrayField: {
            multiple: true,
            fields: {
                arrayField1: {
                    value: 'value',
                    default: 'default',
                },
                arrayField2: {
                    type: 'number',
                    value: 18,
                },
            },
        },
    },
};

export const asyncConfig: Config<ConfigType> = {
    ...config,
    customRules: [
        ...(config.customRules || []),
        {
            name: 'userName',
            message: `Username cannot be 'username'!`,
            // tslint:disable-next-line:variable-name
            callback: (value: any, _req: any, _attr: string, passes) => {
                setTimeout(() => value !== 'username' ? passes()
                : passes(false), 500);
            },
        },
    ],
    fields: {
        ...config.fields,
        basicField: {
            ...config.fields.basicField,
            rules: 'required|password|userName',
        },
    },
};

export const state =  {
    myForm: {
        action: 'http://api.com/endpoint',
        name: 'myForm',
        method: 'POST',
        fields: {
            basicField: {
                key: 'basicField',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                fieldType: 'SIMPLE',
                value: '',
                default: 'default value',
                initial: '',
                rules: 'required|password',
                name: 'basicField',
                id: 'field_1',
                type: 'text',
                label: 'Field 1',
                placeholder: 'Field One',
                disabled: false,
                autoFocus: false,
                autoComplete: 'basicField',
                errors: [],
            },
            parent: {
                key: 'parent',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                fields: {
                    child1: {
                        key: 'child1',
                        focused: false,
                        touched: false,
                        changed: false,
                        showErrors: false,
                        fieldType: 'SIMPLE',
                        value: '',
                        default: '',
                        initial: '',
                        rules: 'required',
                        name: 'child1',
                        id: 'child-1',
                        type: 'text',
                        label: 'Child 1',
                        placeholder: 'Child 1',
                        disabled: false,
                        autoFocus: false,
                        autoComplete: 'child1',
                        errors: [],
                    },
                    child2: {
                        key: 'child2',
                        focused: false,
                        touched: false,
                        changed: false,
                        showErrors: false,
                        fields: {
                            grandchild1: {
                                key: 'grandchild1',
                                focused: false,
                                touched: false,
                                changed: false,
                                showErrors: false,
                                fieldType: 'SIMPLE',
                                value: 'default',
                                default: 'default',
                                initial: 'default',
                                rules: 'email',
                                name: 'grandchild1',
                                id: 'grandchild-1',
                                type: 'text',
                                label: 'Grandchild 1',
                                placeholder: 'Grandchild 1',
                                disabled: false,
                                autoFocus: false,
                                autoComplete: 'grandchild1',
                                errors: [],
                            },
                            grandchild2: {
                                key: 'grandchild2',
                                focused: false,
                                touched: false,
                                changed: false,
                                showErrors: false,
                                fieldType: 'SIMPLE',
                                value: '',
                                default: '',
                                initial: '',
                                rules: '',
                                name: 'grandchild2',
                                id: 'grandchild-2',
                                type: 'number',
                                label: 'Grandchild 2',
                                placeholder: 'Grandchild 2',
                                disabled: false,
                                autoFocus: false,
                                autoComplete: 'grandchild2',
                                errors: [],
                            },
                        },
                        fieldType: 'PARENT',
                    },
                },
                fieldType: 'PARENT',
            },
            arrayField: {
                key: 'arrayField',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                fieldType: 'ARRAY',
                default: {
                    arrayField1: {
                        key: 'arrayField1',
                        focused: false,
                        touched: false,
                        changed: false,
                        showErrors: false,
                        fieldType: 'SIMPLE',
                        value: 'value',
                        default: 'default value',
                        initial: 'value',
                        rules: '',
                        name: 'arrayField1',
                        id: 'array-field-1',
                        type: 'text',
                        label: 'Array Field 1',
                        placeholder: 'Array Field 1',
                        disabled: false,
                        autoFocus: false,
                        autoComplete: 'arrayField1',
                        errors: [],
                    },
                    arrayField2: {
                        key: 'arrayField2',
                        focused: false,
                        touched: false,
                        changed: false,
                        showErrors: false,
                        fieldType: 'SIMPLE',
                        value: 18,
                        default: '',
                        initial: 18,
                        rules: '',
                        name: 'arrayField2',
                        id: 'array-field-2',
                        type: 'number',
                        label: 'Array Field 2',
                        placeholder: 'Array Field 2',
                        disabled: false,
                        autoFocus: false,
                        autoComplete: 'arrayField2',
                        errors: [],
                    },
                },
                fields: [
                    {
                        arrayField1: {
                            key: 'arrayField1[0]',
                            focused: false,
                            touched: false,
                            changed: false,
                            showErrors: false,
                            fieldType: 'SIMPLE',
                            value: 'value',
                            default: 'default value',
                            initial: 'value',
                            rules: '',
                            name: 'arrayField[][arrayField1]',
                            id: 'array-field-1-0',
                            type: 'text',
                            label: 'Array Field 1',
                            placeholder: 'Array Field 1',
                            disabled: false,
                            autoFocus: false,
                            autoComplete: 'arrayField1',
                            errors: [],
                        },
                        arrayField2: {
                            key: 'arrayField2[0]',
                            focused: false,
                            touched: false,
                            changed: false,
                            showErrors: false,
                            fieldType: 'SIMPLE',
                            value: 18,
                            default: '',
                            initial: 18,
                            rules: '',
                            name: 'arrayField[][arrayField2]',
                            id: 'array-field-2-0',
                            type: 'number',
                            label: 'Array Field 2',
                            placeholder: 'Array Field 2',
                            disabled: false,
                            autoFocus: false,
                            autoComplete: 'arrayField2',
                            errors: [],
                        },
                    },
                ],
            },
        },
        isAsync: false,
    },
};

export const asyncState = {
    myForm:{
        ...state.myForm,
        isAsync: true,
        fields: {
            ...state.myForm.fields,
            basicField: {
                ...state.myForm.fields.basicField,
                rules: 'required|password|userName',
            },
        },
    },
};