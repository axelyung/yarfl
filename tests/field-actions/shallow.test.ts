import { fromJS } from 'immutable';
import { shallowConfig } from 'tests/configs';
import { evaluateAction } from 'tests/utils';
import { createTestStore } from '../utils';

const init = createTestStore(shallowConfig);
let store = init.store;
const { initialState, actionCreators } = init.initResult;
const creators = actionCreators.basicForm;

beforeEach(() => {
    store = createTestStore(shallowConfig).store;
});

test('FIELD_UPDATE', () => {
    const updateAction = creators.updateField('field1', 'changed value');
    const expected = fromJS(initialState)
        .mergeDeepIn(['basicForm', 'fields', 'field1'], {
            value: 'changed value',
            touched: true,
            changed: true,
        }).toJS();
    evaluateAction(store)(updateAction, expected);
});

test('FIELD_FOCUSED', () => {
    const focusAction = creators.focusField('field1');
    const expected = fromJS(initialState)
        .mergeDeepIn(['basicForm', 'fields', 'field1'], {
            focused: true,
        }).toJS();
    evaluateAction(store)(focusAction, expected);
});

test('FIELD_BLURRED', () => {
    const blurAction = creators.blurField('field1');
    const expected = fromJS(initialState)
        .mergeDeepIn(['basicForm', 'fields', 'field1'], {
            focused: false,
            touched: true,
            showErrors: true,
            errors: [
                'The field 1 field is required.',
            ],
        }).toJS();
    evaluateAction(store)(blurAction, expected);
});

test('FIELD_CLEAR', () => {
    const clearAction = creators.clearField('field1');
    const expected = fromJS(initialState)
        .mergeDeepIn(['basicForm', 'fields', 'field1'], {
            value: '',
        }).toJS();
    evaluateAction(store)(clearAction, expected);
});

test('FIELD_RESET', () => {
    const updateAction = creators.updateField('field1', 'updated');
    const blurAction = creators.blurField('field1');
    const resetAction = creators.resetField('field1');
    const expected = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
            value: 'default value',
            errors: [],
        }).toJS();
    store.dispatch(updateAction);
    store.dispatch(blurAction);
    evaluateAction(store)(resetAction, expected);
});

test('FIELD_SHOW_ERRORS (void)', () => {
    const showErrorsAction = creators.showFieldErrors('field1');
    const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
            showErrors: true,
            errors: ['The field 1 field is required.'],
        }).toJS();
    evaluateAction(store)(showErrorsAction, expectation);
});

test('FIELD_SHOW_ERRORS (true)', () => {
    const showErrorsAction = creators.showFieldErrors('field1', true);
    const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
            showErrors: true,
            errors: ['The field 1 field is required.'],
        }).toJS();
    evaluateAction(store)(showErrorsAction, expectation);
});

test('FIELD_SHOW_ERRORS (false)', () => {
    const showAction = creators.showFieldErrors('field1');
    const hideAction = creators.showFieldErrors('field1', false);
    store.dispatch(showAction);
    const expectation = fromJS(store.getState())
        .setIn(['basicForm', 'fields', 'field1', 'showErrors'], false)
        .toJS();
    evaluateAction(store)(hideAction, expectation);
});