import { asyncHybridConfig, hybridConfig } from './configs';
import { createTestAssets, evaluateActions, mergeDeepIn, setIn } from './helpers/utils';

const formActions = (creators: any) => ({
    updateShallow: creators.updateForm({ basicField: 'updated' }),
    updateOnceNested: creators.updateForm({ parent: { child1: 'updated' } }),
    updateTwiceNested: creators.updateForm({ parent: { child2: { grandchild1: 'updated' } } }),
    updateArray: creators.updateForm({}),
    updateAll: creators.updateForm({
        basicField: 'updated',
        parent: {
            child1: 'updated',
            child2: {
                grandchild1: 'updated',
            },
        },
    }),
    clear: creators.clearForm(),
    reset: creators.resetForm(),
    validate: creators.validateForm(),
    showErrorsVoid: creators.showFormErrors(),
    showErrorsTrue: creators.showFormErrors(true),
    showErrorsFalse: creators.showFormErrors(false),
});

[asyncHybridConfig, hybridConfig].forEach(config => {
    // tslint:disable-next-line:prefer-const
    let { initialState, actionCreators, store } = createTestAssets(config);
    const creators = actionCreators[config.name];
    const prefix = (key: string) => `${config.name}.${key}`;

    const actions = formActions(creators);

    beforeEach(() => {
        const assets = createTestAssets(config);
        store = assets.store;
        initialState = assets.initialState;
    });

    describe(`${config.name}: FORM_UPDATE`, () => {
        it('should update shallow state', async () => {
            const updateMeta = mergeDeepIn(initialState, prefix('fields.basicField'), {
                value: 'updated',
                touched: true,
                changed: true,
            });
            const updateErrors = setIn(updateMeta, prefix('fields.basicField.errors'), []);
            await evaluateActions(store)(actions.updateShallow, updateErrors);
        });

        it('should update once nested state', async () => {
            const updateMeta = mergeDeepIn(initialState, prefix('fields'), {
                parent: {
                    touched: true,
                    changed: true,
                    fields: {
                        child1: {
                            value: 'updated',
                            touched: true,
                            changed: true,
                        },
                    },
                },
            });
            const updateErrors = setIn(updateMeta, prefix('fields.parent.fields.child1.errors'), []);
            await evaluateActions(store)(actions.updateOnceNested, updateErrors);
        });

        it('should update twice nested state', async () => {
            const updateMeta = mergeDeepIn(initialState, prefix('fields'), {
                parent: {
                    touched: true,
                    changed: true,
                    fields: {
                        child2: {
                            touched: true,
                            changed: true,
                            fields: {
                                grandchild1: {
                                    value: 'updated',
                                    touched: true,
                                    changed: true,
                                },
                            },
                        },
                    },
                },
            });
            const key = prefix('fields.parent.fields.child2.fields.grandchild1.errors');
            const updateErrors = setIn(updateMeta, key, ['The grandchild 1 format is invalid.']);
            await evaluateActions(store)(actions.updateTwiceNested, updateErrors);
        });

        // TODO: it should update array state

        it('should update all fields', async () => {
            const updateMeta = mergeDeepIn(initialState, prefix('fields'), {
                basicField: {
                    value: 'updated',
                    touched: true,
                    changed: true,
                },
                parent: {
                    touched: true,
                    changed: true,
                    fields: {
                        child1: {
                            value: 'updated',
                            touched: true,
                            changed: true,
                        },
                        child2: {
                            touched: true,
                            changed: true,
                            fields: {
                                grandchild1: {
                                    value: 'updated',
                                    touched: true,
                                    changed: true,
                                },
                            },
                        },
                    },
                },
            });
            const updatedBasicfieldErrors = setIn(updateMeta, prefix('fields.basicField.errors'), []);
            const updatedChild1Errors = setIn(updatedBasicfieldErrors, prefix('fields.parent.fields.child1.errors'), []);
            const key = prefix('fields.parent.fields.child2.fields.grandchild1.errors');
            const updatedAllErrors = setIn(updatedChild1Errors, key, ['The grandchild 1 format is invalid.']);
            await evaluateActions(store)(actions.updateAll, updatedAllErrors);
        });
    });

    describe(`${config.name}: FORM_CLEAR`, () => {
        it('should clear state', async () => {
            const updateMeta = mergeDeepIn(initialState, prefix('fields'), {
                basicField: {
                    touched: true,
                    changed: true,
                },
                parent: {
                    touched: true,
                    changed: true,
                    fields: {
                        child1: {
                            touched: true,
                            changed: true,
                        },
                        child2: {
                            touched: true,
                            changed: true,
                            fields: {
                                grandchild1: {
                                    value: '',
                                    touched: true,
                                    changed: true,
                                },
                            },
                        },
                    },
                },
            });
            const arrayField2Key = prefix('fields.arrayField.fields[0].arrayField2');
            const updatedArrayField2Errors = setIn(updateMeta, arrayField2Key, {
                ...(initialState[config.name].fields as any).arrayField.fields[0].arrayField2,
                changed: true,
                errors: ['The array field 2 field is required.'],
                value: '',
            });
            const grandchild1key = prefix('fields.parent.fields.child2.fields.grandchild1.errors');
            const updatedAllErrors = setIn(updatedArrayField2Errors, grandchild1key, []);
            await evaluateActions(store)([
                actions.updateAll,
                actions.clear,
            ], updatedAllErrors);
        });
    });

    describe(`${config.name}: FORM_RESET`, () => {
        it('should reset state', async () => {
            const updateMeta = mergeDeepIn(initialState, prefix('fields'), {
                basicField: {
                    value: 'default',
                },
                parent: {
                    fields: {
                        child1: {
                        },
                        child2: {
                            fields: {
                                grandchild1: {
                                    value: 'default',
                                },
                            },
                        },
                    },
                },
            });
            const updatedBasicFieldErrors = setIn(updateMeta, prefix('fields.basicField.errors'), []);
            const arrayFieldKey = prefix('fields.arrayField.fields[0]');
            const updatedAllErrors = setIn(updatedBasicFieldErrors, arrayFieldKey, {
                arrayField1: {
                    ...(initialState[config.name].fields as any).arrayField.fields[0].arrayField1,
                    value: 'default',
                    errors: [],
                },
                arrayField2: {
                    ...(initialState[config.name].fields as any).arrayField.fields[0].arrayField2,
                    value: '',
                    errors: ['The array field 2 field is required.'],
                },
            });
            await evaluateActions(store)([
                actions.updateAll,
                actions.reset,
            ], updatedAllErrors);
        });
    });

    describe(`${config.name}: FIELD_SHOW_ERRORS`, () => {
        const update1 = mergeDeepIn(initialState, prefix('fields'), {
            basicField: {
                showErrors: true,
            },
            parent: {
                fields: {
                    child1: {
                        showErrors: true,
                    },
                    child2: {
                        fields: {
                            grandchild1: {
                                showErrors: true,
                            },
                            grandchild2: {
                                showErrors: true,
                            },
                        },
                    },
                },
            },
        });
        const showErrorsState = setIn(update1, prefix('fields.arrayField.fields[0]'), {
            arrayField1: {
                ...(initialState[config.name].fields as any).arrayField.fields[0].arrayField1,
                showErrors: true,
            },
            arrayField2: {
                ...(initialState[config.name].fields as any).arrayField.fields[0].arrayField2,
                showErrors: true,
            },
        });

        it('should show errors in state for no argument', async () => {
            await evaluateActions(store)([
                actions.showErrorsVoid,
            ], showErrorsState);
        });
        it('should show errors in state for true argument', async () => {
            await evaluateActions(store)([
                actions.showErrorsTrue,
            ], showErrorsState);
        });
        it('should hide errors in state for false argument', async () => {
            await evaluateActions(store)([
                actions.showErrorsVoid,
                actions.showErrorsFalse,
            ], initialState);
        });
    });
});