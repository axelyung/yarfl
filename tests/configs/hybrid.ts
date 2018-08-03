import { Config } from 'src/typings';
import { arrayConfig, arrayState } from './array';
import { nestedConfig, nestedState } from './nested';

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
        arrayField1: string,
        arrayField2: number,
    }[],
};

export const hybridConfig: Config<ConfigType> = {
    name: 'hybridForm',
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
            default: 'default',
            rules: 'required',
            id: 'field_1',
            type: 'text',
            label: 'Field 1',
            placeholder: 'Field One',
            autoFocus: false,
        },
        ...nestedConfig.fields,
        ...arrayConfig.fields,
    },
};

export const asyncHybridConfig: Config<ConfigType> = {
    ...hybridConfig,
    name: 'asyncHybridForm',
    customRules: [
        ...(hybridConfig.customRules || []),
        {
            name: 'userName',
            message: `Username cannot be 'username'!`,
            // tslint:disable-next-line:variable-name
            callback: (value: any, _req: any, _attr: string, passes) => {
                setTimeout(() => {
                    value !== 'username' ? passes()
                    : passes(false);
                }, 500);
            },
        },
    ],
    fields: {
        ...hybridConfig.fields,
        basicField: {
            ...hybridConfig.fields.basicField,
            rules: 'required|userName',
        },
    },
};

export const hybridState =  {
    hybridForm: {
        action: 'http://api.com/endpoint',
        name: 'hybridForm',
        method: 'POST',
        fields: {
            basicField: {
                key: 'basicField',
                path: 'basicField',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                extra: {},
                fieldType: 'SIMPLE',
                value: '',
                default: 'default',
                initial: '',
                rules: 'required',
                validating: false,
                name: 'basicField',
                id: 'field_1',
                type: 'text',
                label: 'Field 1',
                placeholder: 'Field One',
                disabled: false,
                autoFocus: false,
                autoComplete: 'basicField',
                errors: [
                    'The basic field field is required.',
                ],
            },
            ...nestedState.nestedForm.fields,
            ...arrayState.arrayForm.fields,
        },
        isAsync: false,
        extra: {},
    },
};
