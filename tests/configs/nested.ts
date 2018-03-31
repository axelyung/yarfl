import {
    Config,
    StateWithForms,
    } from 'src/types';

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

export const nestedState: StateWithForms = {
    nestedForm: {
        action: '',
        isAsync: false,
        name: 'nestedForm',
        method: 'POST',
        fields: {
            parent1: {
                key: 'parent1',
                focused: false,
                touched: false,
                changed: false,
                showErrors: false,
                fields: {
                    child1: {
                        default: '',
                        initial: '',
                        autoComplete: 'child1',
                        showErrors: false,
                        autoFocus: false,
                        name: 'child1',
                        errors: [],
                        value: '',
                        placeholder: 'Child 1',
                        changed: false,
                        label: 'Child 1',
                        fieldType: 'SIMPLE',
                        rules: 'required',
                        focused: false,
                        type: 'text',
                        id: 'child-1',
                        disabled: false,
                        touched: false,
                        key: 'child1',
                    },
                    child2: {
                        key: 'child2',
                        focused: false,
                        touched: false,
                        changed: false,
                        showErrors: false,
                        fields: {
                            grandchild1: {
                                default: 'default',
                                initial: 'default',
                                autoComplete: 'grandchild1',
                                showErrors: false,
                                autoFocus: false,
                                name: 'grandchild1',
                                errors: [],
                                value: 'default',
                                placeholder: 'Grandchild 1',
                                changed: false,
                                label: 'Grandchild 1',
                                fieldType: 'SIMPLE',
                                rules: 'email',
                                focused: false,
                                type: 'text',
                                id: 'grandchild-1',
                                disabled: false,
                                touched: false,
                                key: 'grandchild1',
                            },
                            grandchild2: {
                                default: '',
                                initial: '',
                                autoComplete: 'grandchild2',
                                showErrors: false,
                                autoFocus: false,
                                name: 'grandchild2',
                                errors: [],
                                value: '',
                                placeholder: 'Grandchild 2',
                                changed: false,
                                label: 'Grandchild 2',
                                fieldType: 'SIMPLE',
                                rules: '',
                                focused: false,
                                type: 'number',
                                id: 'grandchild-2',
                                disabled: false,
                                touched: false,
                                key: 'grandchild2',
                            },
                        },
                        fieldType: 'PARENT',
                    },
                },
                fieldType: 'PARENT',
            },
        },
    },
};