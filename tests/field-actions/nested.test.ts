import { fromJS } from 'immutable';
import { nestedConfig } from 'tests/configs';
import { createTestStore, evaluateAction } from 'tests/utils';

const init = createTestStore(nestedConfig);
let store = init.store;
const { initialState, actionCreators } = init.initResult;
const creators = actionCreators.nestedForm;
const state = initialState;

beforeEach(() => {
    store = createTestStore(nestedConfig).store;
});

const shallowUpdateAction = creators.updateField('parent1.child1', 'changed value');
const deepUpdateAction = creators.updateField('parent1.child2.grandchild1', 'changed value');

describe('when dispatching FIELD_UPDATE', () => {
    it('should update once nested state', () => {
        const expected = fromJS(state)
        .mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
                touched: true,
                changed: true,
                fields: {
                    child1: {
                        value: 'changed value',
                        touched: true,
                        changed: true,
                    },
                },
            },
        }).toJS();
        evaluateAction(store)(shallowUpdateAction, expected);
    });

    it('should update twice nested state', () => {
        const expected = fromJS(state).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
                touched: true,
                changed: true,
                fields: {
                    child2: {
                        touched: true,
                        changed: true,
                        fields: {
                            grandchild1: {
                                value: 'changed value',
                                touched: true,
                                changed: true,
                            },
                        },
                    },
                },
            },
        }).toJS();
        evaluateAction(store)(deepUpdateAction, expected);
    });
});

describe('when dispatching FIELD_FOCUSED', () => {
    it('should update once nested state', () => {
        const action = creators.focusField('parent1.child1');
        const expected = fromJS(state)
        .mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
                focused: true,
                fields: {
                    child1: {
                        focused: true,
                    },
                },
            },
        }).toJS();
        evaluateAction(store)(action, expected);
    });

    it('should update twice nested state', () => {
        const action = creators.focusField('parent1.child2.grandchild1');
        const expected = fromJS(state).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
            },
        }).toJS();
        evaluateAction(store)(action, expected);
    });
});

describe('when dispatching FIELD_BLURRED', () => {
    it('should update once nested state', () => {
        const action = creators.blurField('parent1.child1');
        const expected = fromJS(state)
            .mergeDeepIn(['nestedForm', 'fields'], {
                parent1: {
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
                },
            }).toJS();
        evaluateAction(store)(action, expected);
    });

    it('should update twice nested state', () => {
        const action = creators.blurField('parent1.child2.grandchild1');
        const expected = fromJS(state).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
            },
        }).toJS();
        evaluateAction(store)(action, expected);
    });
});

describe('when dispatching FIELD_RESET', () => {
    it('should update once nested state', () => {
        store.dispatch(shallowUpdateAction);
        const action = creators.resetField('parent1.child1');
        evaluateAction(store)(action, initialState);
    });

    it('should update twice nested state', () => {
        store.dispatch(deepUpdateAction);
        const action = creators.resetField('parent1.child2.grandchild1');
        evaluateAction(store)(action, initialState);
    });
});

describe('when dispatching FIELD_CLEAR', () => {
    it('should update once nested state', () => {
        store.dispatch(shallowUpdateAction);
        const action = creators.clearField('parent1.child1');
        const expected = fromJS(state)
            .mergeDeepIn(['nestedForm', 'fields'], {
                parent1: {
                    touched: true,
                    changed: true,
                    fields: {
                        child1: {
                            value: '',
                            touched: true,
                            changed: true,
                        },
                    },
                },
            }).toJS();
        evaluateAction(store)(action, expected);
    });

    it('should update twice nested state', () => {
        store.dispatch(deepUpdateAction);
        const action = creators.clearField('parent1.child2.grandchild1');
        const expected = fromJS(state).mergeDeepIn(['nestedForm', 'fields'], {
            parent1: {
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
            },
        }).toJS();
        evaluateAction(store)(action, expected);
    });
});

describe('when dispatching FIELD_VALIDATE', () => {
    it('should update once nested state', () => {
        const action = creators.validateField('parent1.child1');
        const expected = fromJS(initialState)
            .setIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child1', 'errors',
            ], [
                'The child 1 field is required.',
            ]).toJS();
        evaluateAction(store)(action, expected);
    });

    it('should update twice nested state', () => {
        const action = creators.validateField('parent1.child2.grandchild1');
        const expected = fromJS(initialState)
            .setIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child2', 'fields', 'grandchild1', 'errors',
            ], [
                'The grandchild 1 format is invalid.',
            ]).toJS();
        evaluateAction(store)(action, expected);
    });
});

describe('when dispatching FIELD_SHOW_ERRORS (void)', () => {
    it('should update once nested state', () => {
        const action = creators.showFieldErrors('parent1.child1');
        const expected = fromJS(initialState).mergeIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child1',
            ], {
                showErrors: true,
                errors: ['The child 1 field is required.'],
            }).toJS();
        evaluateAction(store)(action, expected);
    });

    it('should update twice nested state', () => {
        const action = creators.showFieldErrors('parent1.child2.grandchild1');
        const expected = fromJS(initialState).mergeIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child2', 'fields', 'grandchild1',
            ], {
                showErrors: true,
                errors: ['The grandchild 1 format is invalid.'],
            }).toJS();
        evaluateAction(store)(action, expected);
    });
});

describe('when dispatching FIELD_SHOW_ERRORS (true)', () => {
    it('should update once nested state', () => {
        const action = creators.showFieldErrors('parent1.child1', true);
        const expected = fromJS(initialState).mergeIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child1',
            ], {
                showErrors: true,
                errors: ['The child 1 field is required.'],
            }).toJS();
        evaluateAction(store)(action, expected);
    });

    it('should update twice nested state', () => {
        const action = creators.showFieldErrors('parent1.child2.grandchild1', true);
        const expected = fromJS(initialState).mergeIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child2', 'fields', 'grandchild1',
            ], {
                showErrors: true,
                errors: ['The grandchild 1 format is invalid.'],
            }).toJS();
        evaluateAction(store)(action, expected);
    });
});

describe('when dispatching FIELD_SHOW_ERRORS (false)', () => {
    it('should update once nested state', () => {
        store.dispatch(creators.showFieldErrors('parent1.child1'));
        const action = creators.showFieldErrors('parent1.child1', false);
        const expected = fromJS(initialState).mergeIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child1',
            ], {
                showErrors: false,
                errors: ['The child 1 field is required.'],
            }).toJS();
        evaluateAction(store)(action, expected);
    });

    it('should update twice nested state', () => {
        store.dispatch(creators.showFieldErrors('parent1.child2.grandchild1'));
        const action = creators.showFieldErrors('parent1.child2.grandchild1', false);
        const expected = fromJS(initialState).mergeIn([
                'nestedForm', 'fields', 'parent1', 'fields', 'child2', 'fields', 'grandchild1',
            ], {
                showErrors: false,
                errors: ['The grandchild 1 format is invalid.'],
            }).toJS();
        evaluateAction(store)(action, expected);
    });
});