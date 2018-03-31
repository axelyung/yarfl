import { fromJS } from 'immutable';
import { asyncConfig, asyncState } from 'tests/configs';
import { createTestStore, evaluateAction, evaluateActionAsync } from 'tests/utils';

const init = createTestStore(asyncConfig);
let store = init.store;
const creators = init.initResult.actionCreators.asyncForm;

beforeEach(() => {
    store = createTestStore(asyncConfig).store;
});

const updateAction = creators.updateForm({
    userName: 'updated',
});

const path = ['asyncForm', 'fields'];

test('FORM_UPDATE', () => {
    const expected = fromJS(asyncState).mergeDeepIn(path, {
        userName: {
            value: 'updated',
            touched: true,
            changed: true,
        },
    }).toJS();
    evaluateAction(store)(updateAction, expected);
});

test('FORM_CLEAR', () => {
    const clearAction = creators.clearForm();
    const expected = fromJS(asyncState).mergeDeepIn(path, {
        userName: {
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
    const expected = fromJS(asyncState).mergeDeepIn(path, {
        userName: {
            value: asyncConfig.fields.userName.default,
        },
    }).toJS();
    store.dispatch(updateAction);
    evaluateAction(store)(resetAction, expected);
});

test('FORM_VALIDATE', () => {
    const validateAction = creators.validateForm();
    const expected = fromJS(asyncState).mergeDeepIn(path, {
            userName: {
                errors: [`Username cannot be 'username'!`],
            },
        }).toJS();
    return evaluateActionAsync(store)(validateAction, expected);
});

test('FORM_SHOW_ERRORS', () => {
    const showErrorsAction = creators.showFormErrors();
    const expected = fromJS(asyncState).mergeDeepIn(path, {
        userName: {
            showErrors: true,
            errors: [`Username cannot be 'username'!`],
        },
    }).toJS();
    evaluateAction(store)(showErrorsAction, expected);
});
