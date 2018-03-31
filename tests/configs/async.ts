import {
    Config,
    StateWithForms,
    } from 'src/types';

type AsyncState = {
    userName: string,
};

export const asyncConfig: Config<AsyncState> = {
    name: 'asyncForm',
    action: 'http://api.com/endpoint',
    customRules: [{
        name: 'userName',
        message: `Username cannot be 'username'!`,
        // tslint:disable-next-line:variable-name
        callback: (value: any, _req: any, _attr: string, passes) => {
            setTimeout(() => value !== 'username' ? passes()
                : passes(false), 500);
        },
    }],
    fields: {
        userName: {
            value: 'username',
            default: 'default value',
            rules: 'userName',
            id: 'field_1',
            type: 'text',
            label: 'Field 1',
            placeholder: 'Field One',
            autoFocus: false,
        },
    },
};

export const asyncState: StateWithForms = {
    asyncForm: {
        action: 'http://api.com/endpoint',
        name: 'asyncForm',
        isAsync: true,
        method: 'POST',
        fields: {
            userName: {
                default: 'default value',
                initial: 'username',
                autoComplete: 'userName',
                showErrors: false,
                autoFocus: false,
                name: 'userName',
                errors: [],
                value: 'username',
                placeholder: 'Field One',
                changed: false,
                label: 'Field 1',
                fieldType: 'SIMPLE',
                rules: 'userName',
                focused: false,
                type: 'text',
                id: 'field_1',
                disabled: false,
                touched: false,
                key: 'userName',
            },
        },
    },
};