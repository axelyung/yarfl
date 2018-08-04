import { Config, StateWithForms } from 'src/typings';

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
            setTimeout(() => {
                value !== 'username' ? passes()
                : passes(false);
            }, 500);
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
        method: 'POST',
        fields: {
            userName: {
                key: 'userName',
                path: 'userName',
                focused: false,
                touched: false,
                blurred: false,
                changed: false,
                showErrors: false,
                extra: {},
                fieldType: 'SIMPLE',
                value: 'username',
                default: 'default value',
                initial: 'username',
                rules: 'userName',
                name: 'userName',
                validating: false,
                id: 'field_1',
                type: 'text',
                label: 'Field 1',
                placeholder: 'Field One',
                disabled: false,
                autoFocus: false,
                autoComplete: 'userName',
                errors: ['Username cannot be \'username\'!'],
            },
        },
        isAsync: true,
        extra: {},
    },
};
