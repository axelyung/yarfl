import { asyncHybridConfig, hybridConfig } from './configs';
import { createTestAssets, evaluateActions, getIn, mergeDeep, mergeDeepIn, mergeIn, setIn } from './helpers/utils';

const keys = {
    shallowField: 'basicField',
    onceNestedField: 'parent.child1',
    twiceNestedField: 'parent.child2.grandchild1',
    onceNestedNode: 'parent',
    twiceNestedNode: 'parent.child2',
};

const fieldActions = (creators: any, key: string) => ({
    update: creators.updateField(key, 'updated'),
    focus: creators.focusField(key),
    clear: creators.clearField(key),
    reset: creators.resetField(key),
    blur: creators.blurField(key),
    validate: creators.validateField(key),
    showErrorsVoid: creators.showFieldErrors(key),
    showErrorsTrue: creators.showFieldErrors(key, true),
    showErrorsFalse: creators.showFieldErrors(key, false),
});

const nodeActions = (creators: any, key: string) => ({
    clear: creators.clearNode(key),
    reset: creators.resetNode(key),
    validate: creators.validateNode(key),
    showErrorsVoid: creators.showNodeErrors(key),
    showErrorsTrue: creators.showNodeErrors(key, true),
    showErrorsFalse: creators.showNodeErrors(key, false),
});

[asyncHybridConfig, hybridConfig].forEach(config => {
    // tslint:disable-next-line:prefer-const
    let { initialState, actionCreators, store } = createTestAssets(config);
    const creators = actionCreators[config.name];
    const prefix = (key: string) => `${config.name}.${key}`;

    const actions = {
        shallowField: fieldActions(creators, keys.shallowField),
        onceNestedField: fieldActions(creators, keys.onceNestedField),
        twiceNestedField: fieldActions(creators, keys.twiceNestedField),
        onceNestedNode: {
            ...nodeActions(creators, keys.onceNestedNode),
            update: creators.updateNode(keys.onceNestedNode, { child1: 'updated' }),
        },
        twiceNestedNode: {
            ...nodeActions(creators, keys.twiceNestedNode),
            update: creators.updateNode(keys.twiceNestedNode, { grandchild1: 'updated', grandchild2: 2 }),
        },
    };

    beforeEach(() => {
        const assets = createTestAssets(config);
        store = assets.store;
        initialState = assets.initialState;
    });

    describe(`${config.name}: FIELD_UPDATE`, () => {
        it('should update shallow state', async () => {
            const updateMeta = mergeDeepIn(initialState, prefix('fields.basicField'), {
                value: 'updated',
                touched: true,
                changed: true,
            });
            const updateErrors = setIn(updateMeta, prefix('fields.basicField.errors'), []);
            await evaluateActions(store)(actions.shallowField.update, updateErrors);
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
            await evaluateActions(store)(actions.onceNestedField.update, updateErrors);
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
            await evaluateActions(store)(actions.twiceNestedField.update, updateErrors);
        });
        // it('should update once nested node', async () => {
        //     const updateMeta = mergeDeepIn(initialState, prefix('fields'), {
        //         parent: {
        //             touched: true,
        //             changed: true,
        //             fields: {
        //                 child1: {
        //                     value: 'updated',
        //                     touched: true,
        //                     changed: true,
        //                 },
        //             },
        //         },
        //     });
        //     const updateErrors = setIn(updateMeta, prefix('fields.parent.fields.child1.errors'), []);
        //     await evaluateActions(store)(actions.onceNestedNode.update, updateErrors);
        // });

        // it('should update twice nested node', async () => {
        //     const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
        //         parent: {
        //             touched: true,
        //             changed: true,
        //             fields: {
        //                 child2: {
        //                     touched: true,
        //                     changed: true,
        //                     fields: {
        //                         grandchild1: {
        //                             value: 'updated',
        //                             touched: true,
        //                             changed: true,
        //                         },
        //                         grandchild2: {
        //                             value: 2,
        //                             touched: true,
        //                             changed: true,
        //                         },
        //                     },
        //                 },
        //             },
        //         },
        //     });
        //     await evaluateActions(store)(actions.twiceNestedNode.update, expected);
        // });
        // it('array fields', () => {});
    });

    describe(`${config.name}: FIELD_FOCUS`, () => {
        it('should focus shallow state', async () => {
            const expected = setIn(initialState, prefix('fields.basicField.focused'), true);
            await evaluateActions(store)(actions.shallowField.focus, expected);
        });
        it('should focus once nested state', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                focused: true,
                fields: {
                    child1: {
                        focused: true,
                    },
                },
            });
            await evaluateActions(store)(actions.onceNestedField.focus, expected);
        });

        it('should focus twice nested state', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                focused: true,
                fields: {
                    child2: {
                        focused: true,
                        fields: {
                            grandchild1: {
                                focused: true,
                            },
                        },
                    },
                },
            });
            await evaluateActions(store)(actions.twiceNestedField.focus, expected);
        });
        // it('array fields', () => {});
    });

    describe(`${config.name}: FIELD_BLURRED`, () => {
        it('should blur shallow state', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.basicField'), {
                focused: false,
                touched: true,
                showErrors: true,
                errors: [
                    'The basic field field is required.',
                ],
            });
            await evaluateActions(store)(actions.shallowField.blur, expected);
        });
        it('should blur once nested state', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                touched: true,
                fields: {
                    child1: {
                        touched: true,
                        showErrors: true,
                        errors: [
                            'The child 1 field is required.',
                        ],
                    },
                },
            });
            await evaluateActions(store)(actions.onceNestedField.blur, expected);
        });
        it('should blur twice nested state', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                touched: true,
                fields: {
                    child2: {
                        touched: true,
                        fields: {
                            grandchild1: {
                                touched: true,
                                showErrors: true,
                                errors: [
                                    'The grandchild 1 format is invalid.',
                                ],
                            },
                        },
                    },
                },
            });
            await evaluateActions(store)(actions.twiceNestedField.blur, expected);
        });
        // it.skip('array fields', () => {});
    });

    describe(`${config.name}: FIELD_CLEAR`, () => {
        it('should clear shallow state', async () => {
            const expected = mergeIn(initialState, prefix('fields.basicField'), {
                value: '',
                changed: true,
                touched: true,
                errors: ['The basic field field is required.'],
            });
            await evaluateActions(store)([
                actions.shallowField.update,
                actions.shallowField.clear,
            ], expected);
        });
        it('should clear once nested state', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                touched: true,
                changed: true,
                fields: {
                    child1: {
                        value: '',
                        touched: true,
                        changed: true,
                        errors: ['The child 1 field is required.'],
                    },
                },
            });
            await evaluateActions(store)([
                actions.onceNestedField.update,
                actions.onceNestedField.clear,
            ], expected);
        });

        it('should clear twice nested state', async () => {
            const metaUpdated = mergeDeepIn(initialState, prefix('fields.parent'), {
                touched: true,
                changed: true,
                fields: {
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
            });
            const errorsUpdated = setIn(metaUpdated, prefix('fields.parent.fields.child2.fields.grandchild1.errors'), []);
            await evaluateActions(store)([
                actions.twiceNestedField.update,
                actions.twiceNestedField.clear,
            ], errorsUpdated);
        });
        it.skip('should clear once nested node', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                touched: true,
                changed: true,
                fields: {
                    child1: {
                        value: '',
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
                            grandchild2: {
                                value: '',
                                touched: true,
                                changed: true,
                            },
                        },
                    },
                },
            });
            store.dispatch(actions.onceNestedNode.update);
            store.dispatch(actions.twiceNestedNode.update);
            await evaluateActions(store)(actions.onceNestedNode.clear, expected);
        });

        it.skip('should clear twice nested node', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
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
                                    value: '',
                                    touched: true,
                                    changed: true,
                                },
                                grandchild2: {
                                    value: '',
                                    touched: true,
                                    changed: true,
                                },
                            },
                        },
                    },
                },
            });
            store.dispatch(actions.onceNestedNode.update);
            store.dispatch(actions.twiceNestedNode.update);
            await evaluateActions(store)(actions.twiceNestedNode.clear, expected);
        });
        it.skip('array fields', () => {});
    });

    describe(`${config.name}: FIELD_RESET`, () => {
        it('should reset shallow state', async () => {
            const expected = mergeIn(initialState, prefix('fields.basicField'), {
                value: 'default',
                errors: [],
            });
            await evaluateActions(store)([
                actions.shallowField.update,
                actions.shallowField.blur,
                actions.shallowField.reset,
            ], expected);
        });
        it('should reset once nested state', async () => {
            const expected = setIn(initialState, prefix('fields.parent.fields.child1.errors'), [
                'The child 1 field is required.',
            ]);
            await evaluateActions(store)([
                actions.onceNestedField.update,
                actions.onceNestedField.blur,
                actions.onceNestedField.reset,
            ], expected);
        });

        it('should reset twice nested state', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent.fields'), {
                child2: {
                    fields: {
                        grandchild1: {
                            errors:['The grandchild 1 format is invalid.'],
                        },
                    },
                },
            });
            await evaluateActions(store)([
                actions.twiceNestedField.update,
                actions.twiceNestedField.blur,
                actions.twiceNestedField.reset,
            ], expected);
        });
        it.skip('should reset once nested node', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                parent: {
                    fields: {
                        child1: {
                            value: '',
                        },
                        child2: {
                            fields: {
                                grandchild1: {
                                    value: 'default',
                                },
                                grandchild2: {
                                    value: '',
                                },
                            },
                        },
                    },
                },
            });
            store.dispatch(actions.onceNestedNode.update);
            store.dispatch(actions.twiceNestedNode.update);
            await evaluateActions(store)(actions.onceNestedNode.reset, expected);
        });

        it.skip('should reset twice nested node', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
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
                            fields: {
                                grandchild1: {
                                    value: 'default',
                                },
                                grandchild2: {
                                    value: '',
                                },
                            },
                        },
                    },
                },
            });
            store.dispatch(actions.onceNestedNode.update);
            store.dispatch(actions.twiceNestedNode.update);
            await evaluateActions(store)(actions.twiceNestedNode.reset, expected);
        });
        it.skip('array fields', () => {});
    });

    describe(`${config.name}: FIELD_SHOW_ERRORS (void)`, () => {
        it('should update shallow state', async () => {
            const expectation = mergeIn(initialState, prefix('fields.basicField'), {
                showErrors: true,
                errors: ['The basic field field is required.'],
            });
            await evaluateActions(store)(actions.shallowField.showErrorsVoid, expectation);
        });
        it('should update once nested state', async () => {
            const expected = mergeIn(initialState, prefix('fields.parent.fields.child1'), {
                showErrors: true,
                errors: ['The child 1 field is required.'],
            });
            await evaluateActions(store)(actions.onceNestedField.showErrorsVoid, expected);
        });

        it('should update twice nested state', async () => {
            const expected = mergeIn(initialState, prefix('fields.parent.fields.child2.fields.grandchild1'), {
                showErrors: true,
                errors: ['The grandchild 1 format is invalid.'],
            });
            await evaluateActions(store)(actions.twiceNestedField.showErrorsVoid, expected);
        });
        it.skip('should show errors for once nested node', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                parent: {
                    fields: {
                        child1: {
                            value: '',
                            showErrors: true,
                        },
                        child2: {
                            fields: {
                                grandchild1: {
                                    value: 'default',
                                    showErrors: true,
                                },
                                grandchild2: {
                                    value: '',
                                    showErrors: true,
                                },
                            },
                        },
                    },
                },
            });
            store.dispatch(actions.onceNestedNode.update);
            store.dispatch(actions.twiceNestedNode.update);
            store.dispatch(actions.onceNestedNode.reset);
            await evaluateActions(store)(actions.onceNestedNode.showErrorsVoid, expected);
        });

        it.skip('should show errors for twice nested node', async () => {
            const expected = mergeDeepIn(initialState, prefix('fields.parent'), {
                parent: {
                    fields: {
                        child2: {
                            fields: {
                                grandchild1: {
                                    value: 'default',
                                    showErrors: true,
                                },
                                grandchild2: {
                                    value: '',
                                    showErrors: true,
                                },
                            },
                        },
                    },
                },
            });
            store.dispatch(actions.onceNestedNode.update);
            store.dispatch(actions.twiceNestedNode.update);
            store.dispatch(actions.onceNestedNode.reset);
            await evaluateActions(store)(actions.twiceNestedNode.showErrorsVoid, expected);
        });
        it.skip('array fields', () => {});
    });

    describe(`${config.name}: FIELD_SHOW_ERRORS (true)`, () => {
        it('should show errors for shallow state', async () => {
            const expectation = mergeIn(initialState, prefix('fields.basicField'), {
                showErrors: true,
                errors: ['The basic field field is required.'],
            });
            await evaluateActions(store)(actions.shallowField.showErrorsTrue, expectation);
        });
        it('should show errors for once nested state', async () => {
            const expected = mergeIn(initialState, prefix('fields.parent.fields.child1'), {
                showErrors: true,
                errors: ['The child 1 field is required.'],
            });
            await evaluateActions(store)(actions.onceNestedField.showErrorsTrue, expected);
        });

        it('should show errors for twice nested state', async () => {
            const expected = mergeIn(initialState, prefix('fields.parent.fields.child2.fields.grandchild1'), {
                showErrors: true,
                errors: ['The grandchild 1 format is invalid.'],
            });
            await evaluateActions(store)(actions.twiceNestedField.showErrorsTrue, expected);
        });
        it.skip('node fields', async () => {});
        it.skip('array fields', () => {});
    });

    describe(`${config.name}: FIELD_SHOW_ERRORS (false)`, () => {
        it('should hide errors for shallow state', async () => {
            const expectation = mergeIn(initialState, prefix('fields.basicField'), {
                showErrors: false,
                errors: ['The basic field field is required.'],
            });
            await evaluateActions(store)([
                actions.shallowField.validate,
                actions.shallowField.showErrorsFalse,
            ], expectation);
        });
        it('should hide errors for once nested state', async () => {
            const expected = mergeIn(initialState, prefix('fields.parent.fields.child1'), {
                showErrors: false,
                errors: ['The child 1 field is required.'],
            });
            await evaluateActions(store)([
                actions.onceNestedField.validate,
                actions.onceNestedField.showErrorsFalse,
            ], expected);
        });

        it('should hide errors for twice nested state', async () => {
            const expected = mergeIn(initialState, prefix('fields.parent.fields.child2.fields.grandchild1'), {
                showErrors: false,
                errors: ['The grandchild 1 format is invalid.'],
            });
            await evaluateActions(store)([
                actions.twiceNestedField.validate,
                actions.twiceNestedField.showErrorsFalse,
            ], expected);
        });
        it.skip('node fields', () => {});
        it.skip('array fields', () => {});
    });

    describe(`${config.name}: When dispatching array actions to the store`, () => {

        it('ARRAY_FIELD_ADD', async () => {
            const action = creators.addArrayField('arrayField');
            const fields = getIn(initialState, prefix('fields.arrayField.fields')) as any[];
            const template = getIn(initialState, prefix('fields.arrayField.default'));
            const newField1 = mergeDeep(template, {
                arrayField1: {
                    key: '[1].arrayField1',
                    path: 'arrayField[1].arrayField1',
                    name: 'arrayField[][arrayField1]',
                    id: 'array-field-1-1',
                    errors: ['The array field 1 field is required.'],
                },
                arrayField2: {
                    key: '[1].arrayField2',
                    path: 'arrayField[1].arrayField2',
                    name: 'arrayField[][arrayField2]',
                    id: 'array-field-2-1',
                    errors: ['The array field 2 must be at least 18.'],
                },
            });
            const updatedFields1 = [...fields, newField1];
            const expected1 = setIn(initialState, prefix('fields.arrayField.fields'), updatedFields1);
            await evaluateActions(store)(action, expected1);
        });

        it.skip('ARRAY_FIELD_DELETE', async () => {
            const addAction = creators.addArrayField('arrayField');
            const deleteAction = creators.deleteArrayField('arrayField', 1);
            await evaluateActions(store)([addAction, deleteAction], initialState);
        });
    });
});
