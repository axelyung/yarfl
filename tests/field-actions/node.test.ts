import { fromJS } from 'immutable';
import { nestedConfig } from 'tests/configs';
import { createTestStore, evaluateAction } from 'tests/utils';

const init = createTestStore(nestedConfig);
let store = init.store;
const { initialState, actionCreators } = init.initResult;
const creators = actionCreators.nestedForm;

beforeEach(() => {
    store = createTestStore(nestedConfig).store;
});

const shallowKey = 'parent1';
const deepKey = 'parent1.child2';

const actions = {
    shallow: {
        update: creators.updateNode(shallowKey, { child1: 'updated' }),
        clear: creators.clearNode(shallowKey),
        reset: creators.resetNode(shallowKey),
        validate: creators.validateNode(shallowKey),
        showErrors: creators.showNodeErrors(shallowKey),
    },
    deep: {
        update: creators.updateNode(deepKey, { grandchild1: 'updated', grandchild2: 2 }),
        clear: creators.clearNode(deepKey),
        reset: creators.resetNode(deepKey),
        validate: creators.validateNode(deepKey),
        showErrors: creators.showNodeErrors(deepKey),
    },
};

describe('when dispatching FIELD_UPDATE', () => {
    it('should update once nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
        }).toJS();
        evaluateAction(store)(actions.shallow.update, expected);
    });

    it('should update twice nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
                            grandchild2: {
                                value: 2,
                                touched: true,
                                changed: true,
                            },
                        },
                    },
                },
            },
        }).toJS();
        evaluateAction(store)(actions.deep.update, expected);
    });

    it('should clear once nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
            },
        }).toJS();
        store.dispatch(actions.shallow.update);
        store.dispatch(actions.deep.update);
        evaluateAction(store)(actions.shallow.clear, expected);
    });

    it('should clear twice nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
                parent1: {
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
            }).toJS();
        store.dispatch(actions.shallow.update);
        store.dispatch(actions.deep.update);
        evaluateAction(store)(actions.deep.clear, expected);
    });

    it('should reset once nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
        }).toJS();
        store.dispatch(actions.shallow.update);
        store.dispatch(actions.deep.update);
        evaluateAction(store)(actions.shallow.reset, expected);
    });

    it.skip('should reset twice nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
        }).toJS();
        store.dispatch(actions.shallow.update);
        store.dispatch(actions.deep.update);
        evaluateAction(store)(actions.deep.reset, expected);
    });

    it('should show errors for once nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
        }).toJS();
        store.dispatch(actions.shallow.update);
        store.dispatch(actions.deep.update);
        store.dispatch(actions.shallow.reset);
        evaluateAction(store)(actions.shallow.showErrors, expected);
    });

    it('should show errors for twice nested state', () => {
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
        }).toJS();
        store.dispatch(actions.shallow.update);
        store.dispatch(actions.deep.update);
        store.dispatch(actions.shallow.reset);
        evaluateAction(store)(actions.deep.showErrors, expected);
    });

    it('should validate for once nested state', () => {
        const configWOV = {
            ...nestedConfig,
            validateOnInit: false,
        };
        const test = createTestStore(configWOV);
        store = test.store;
        const state = test.initResult.initialState;
        const expected = fromJS(state).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
                fields: {
                    child1: {
                        errors: ['The child 1 field is required.'],
                    },
                    child2: {
                        fields: {
                            grandchild1: {
                                errors: ['The grandchild 1 format is invalid.'],
                            },
                        },
                    },
                },
            },
        }).toJS();
        evaluateAction(store)(actions.shallow.validate, expected);
    });

    it('should validate for twice nested state', () => {
        const configWOV = {
            ...nestedConfig,
            validateOnInit: false,
        };
        const initialized = createTestStore(configWOV);
        store = initialized.store;
        const expected = fromJS(initialState).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
                fields: {
                    child2: {
                        fields: {
                            grandchild1: {
                                errors: ['The grandchild 1 format is invalid.'],
                            },
                        },
                    },
                },
            },
        }).toJS();
        evaluateAction(store)(actions.deep.validate, expected);
    });
});