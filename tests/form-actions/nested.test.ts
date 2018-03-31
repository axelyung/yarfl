import { fromJS } from 'immutable';
import { nestedConfig, nestedState } from 'tests/configs';
import { createTestStore, evaluateAction } from 'tests/utils';

const init = createTestStore(nestedConfig);
let store = init.store;
const { actionCreators } = init.initResult;
const creators = actionCreators.nestedForm;

beforeEach(() => {
    store = createTestStore(nestedConfig).store;
});

const updateAction = creators.updateForm({
    parent1: {
        child1: 'changed',
        child2: {
            grandchild2: 3,
        },
    },
});

test('FORM_UPDATE', () => {
    const expected = fromJS(nestedState).mergeDeepIn(['nestedForm', 'fields', 'parent1'], {
        touched: true,
        changed: true,
        fields: {
            child1: {
                value: 'changed',
                touched: true,
                changed: true,
            },
            child2: {
                touched: true,
                changed: true,
                fields: {
                    grandchild2: {
                        value: 3,
                        touched: true,
                        changed: true,
                    },
                },
            },
        },
    }).toJS();
    evaluateAction(store)(updateAction, expected);
});

test('FORM_CLEAR', () => {
    store.dispatch(updateAction);
    const clearAction = creators.clearForm();
    const expected = fromJS(nestedState).mergeDeepIn(['nestedForm', 'fields', 'parent1'], {
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
    }).toJS();
    evaluateAction(store)(clearAction, expected);
});

test('FORM_RESET', () => {
    store.dispatch(updateAction);
    const resetAction = creators.resetForm();
    const expected = fromJS(nestedState).mergeDeepIn(['nestedForm', 'fields', 'parent1', 'fields'], {
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
    }).toJS();
    evaluateAction(store)(resetAction, expected);
});
