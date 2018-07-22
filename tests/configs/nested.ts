import { Config, StateWithForms } from 'src/typings';

type NestedState = {
    parent1: {
        child1: string,
        child2: {
            grandchild1: string,
            grandchild2: number,
        },
    },
};

export const nestedConfig: Config<NestedState> = {
    name: 'nestedForm',
    fields: {
        parent1: {
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
    },
};

export const nestedState: StateWithForms =  {
    nestedForm: {
        action: '',
        name: 'nestedForm',
        method: 'POST',
        fields: {
            parent1: {
                key: 'parent1',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                extra: {},
                fields: {
                    child1: {
                        key: 'child1',
                        focused: false,
                        touched: false,
                        changed: false,
                        showErrors: false,
                        extra: {},
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
                        errors: [
                            'The child 1 field is required.',
                        ],
                    },
                    child2: {
                        key: 'child2',
                        focused: false,
                        touched: false,
                        changed: false,
                        showErrors: false,
                        extra: {},
                        fields: {
                            grandchild1: {
                                key: 'grandchild1',
                                focused: false,
                                touched: false,
                                changed: false,
                                showErrors: false,
                                extra: {},
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
                                errors: [
                                    'The grandchild 1 format is invalid.',
                                ],
                            },
                            grandchild2: {
                                key: 'grandchild2',
                                focused: false,
                                touched: false,
                                changed: false,
                                showErrors: false,
                                extra: {},
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
        },
        isAsync: false,
        extra: {},
    },
};