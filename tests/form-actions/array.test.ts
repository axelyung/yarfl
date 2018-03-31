import { fromJS } from 'immutable';
import { arrayConfig, arrayState } from 'tests/configs';
import { createTestStore, evaluateAction, evaluateActionAsync } from 'tests/utils';

const init = createTestStore(arrayConfig);
let store = init.store;
const creators = init.initResult.actionCreators.arrayForm;

beforeEach(() => {
    store = createTestStore(arrayConfig).store;
});

const updateAction = creators.updateForm({
    field1: [{
        nestedField1: 'nested1 changed',
        nestedField2: 'nested2 changed',
    }],
});

const path = ['arrayForm', 'fields'];

test.skip('FORM_UPDATE', () => {
    const expected = fromJS(arrayState).mergeDeepIn(path, {
        field1: {
            value: 'updated',
            touched: true,
            changed: true,
        },
    }).toJS();
    evaluateAction(store)(updateAction, expected);
});

test.skip('FORM_CLEAR', () => {
    const clearAction = creators.clearForm();
    const expected = fromJS(arrayState).mergeDeepIn(path, {
        field1: {
            value: '',
            touched: true,
            changed: true,
        },
    }).toJS();
    store.dispatch(updateAction);
    evaluateAction(store)(clearAction, expected);
});

test.skip('FORM_RESET', () => {
    const resetAction = creators.resetForm();
    const expected = fromJS(arrayState).mergeDeepIn(path, {
        field1: {
            value: arrayConfig.fields.field1.default,
        },
    }).toJS();
    store.dispatch(updateAction);
    evaluateAction(store)(resetAction, expected);
});

test.skip('FORM_VALIDATE', () => {
    const validateAction = creators.validateForm();
    const expected = fromJS(arrayState).mergeDeepIn(path, {
            field1: {
                errors: [`Username cannot be 'username'!`],
            },
        }).toJS();
    return evaluateActionAsync(store)(validateAction, expected);
});

test.skip('FORM_SHOW_ERRORS', () => {
    const showErrorsAction = creators.showFormErrors();
    const expected = fromJS(arrayState).mergeDeepIn(path, {
        field1: {
            showErrors: true,
            errors: [`Username cannot be 'username'!`],
        },
    }).toJS();
    evaluateAction(store)(showErrorsAction, expected);
});
