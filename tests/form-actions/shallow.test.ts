import { fromJS } from 'immutable';
import { shallowConfig, shallowState } from 'tests/configs';
import { createTestStore, evaluateAction, timer } from 'tests/utils';

const init = createTestStore(shallowConfig);
let store = init.store;
const { actionCreators } = init.initResult;
const creators = actionCreators.basicForm;

beforeEach(() => {
    store = createTestStore(shallowConfig).store;
});

const updateAction = creators.updateForm({
    field1: 'changed value',
    field2: 17,
});
// const updatedState = reducer(shallowState, updateAction);
timer(() => {

    test('FORM_UPDATE', () => {
        const expected = fromJS(shallowState).mergeDeepIn(['basicForm', 'fields'], {
        field1: {
            value: 'changed value',
            touched: true,
            changed: true,
        },
        field2: {
            value: 17,
            touched: true,
            changed: true,
        },
    }).toJS();
        evaluateAction(store)(updateAction, expected);
    });

    test('FORM_CLEAR', () => {
        const clearAction = creators.clearForm();
        const expected = fromJS(shallowState).mergeDeepIn(['basicForm', 'fields'], {
        field1: {
            value: '',
            touched: true,
            changed: true,
        },
        field2: {
            value: '',
            touched: true,
            changed: true,
        },
    }).toJS();
        store.dispatch(updateAction);
        evaluateAction(store)(clearAction, expected);
    });

    test('FORM_RESET', () => {
        const resetAction = creators.resetForm();
        const expected = fromJS(shallowState).mergeDeepIn(['basicForm', 'fields'], {
        field1: {
            value: shallowConfig.fields.field1.default,
        },
        field2: {
            value: shallowConfig.fields.field2.default,
        },
    }).toJS();
        store.dispatch(updateAction);
        evaluateAction(store)(resetAction, expected);
    });

    test('FORM_SHOW_ERRORS', () => {
        const showErrorsAction = creators.showFormErrors();
        const expected = fromJS(shallowState).mergeDeepIn(['basicForm', 'fields'], {
        field1: {
            showErrors: true,
            errors: [
                'The field 1 field is required.',
            ],
        },
        field2: {
            showErrors: true,
        },
    }).toJS();
        evaluateAction(store)(showErrorsAction, expected);
    });

    test('FORM_VALIDATE', () => {
        const validateAction = creators.validateForm();
        const expected = fromJS(shallowState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
            errors: [
                'The field 1 field is required.',
            ],
        }).toJS();
        evaluateAction(store)(validateAction, expected);
    });
}, 'SHALLOW_FORM_ACTIONS');