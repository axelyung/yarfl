import { fromJS } from 'immutable';
import { asyncConfig } from 'tests/configs';
import { createTestStore, evaluateAction } from 'tests/utils';

const init = createTestStore(asyncConfig);
let store = init.store;
const { initialState, actionCreators } = init.initResult;
const creators = actionCreators.asyncForm;

beforeEach(() => {
    store = createTestStore(asyncConfig).store;
});

test('FIELD_UPDATE', () => {
    const updateAction = creators.updateField('userName', 'changed value');
    const expected = fromJS(initialState)
        .mergeDeepIn(['asyncForm', 'fields', 'userName'], {
            value: 'changed value',
            touched: true,
            changed: true,
        }).toJS();
    evaluateAction(store)(updateAction, expected);
});
test('FIELD_FOCUSED', () => {
    const focusAction = creators.focusField('userName');
    const expected = fromJS(initialState)
        .mergeDeepIn(['asyncForm', 'fields', 'userName'], {
            focused: true,
        }).toJS();
    evaluateAction(store)(focusAction, expected);
});

test('FIELD_BLURRED', async () => {
    const blurAction = creators.blurField('userName');
    const expected = fromJS(initialState)
        .mergeDeepIn(['asyncForm', 'fields', 'userName'], {
            focused: false,
            touched: true,
            showErrors: true,
            errors: [
                'Username cannot be \'username\'!',
            ],
        }).toJS();
    expect.assertions(1);
    await store.dispatch(blurAction);
    const reduction = store.getState();
    expect(reduction).toEqual(expected);
});

test('FIELD_CLEAR', () => {
    const clearAction = creators.clearField('userName');
    const expected = fromJS(initialState)
        .mergeDeepIn(['asyncForm', 'fields', 'userName'], {
            value: '',
            changed: true,
        }).toJS();
    evaluateAction(store)(clearAction, expected);
});

test('FIELD_RESET', () => {
    const updateAction = creators.updateField('userName', 'updated');
    const blurAction = creators.blurField('userName');
    const resetAction = creators.resetField('userName');
    const expected = fromJS(initialState)
        .mergeIn(['asyncForm', 'fields', 'userName'], {
            value: 'default value',
            errors: [],
        }).toJS();
    store.dispatch(updateAction);
    store.dispatch(blurAction);
    evaluateAction(store)(resetAction, expected);
});

test('FIELD_VALIDATE', async () => {
    const showErrorsAction = creators.validateField('userName');
    const expected = fromJS(initialState)
        .mergeIn(['asyncForm', 'fields', 'userName'], {
            errors: ['Username cannot be \'username\'!'],
        }).toJS();
    expect.assertions(1);
    await store.dispatch(showErrorsAction);
    expect(store.getState()).toEqual(expected);
});

test('FIELD_SHOW_ERRORS (void)', async () => {
    const showErrorsAction = creators.showFieldErrors('userName');
    const expected = fromJS(initialState)
        .mergeIn(['asyncForm', 'fields', 'userName'], {
            showErrors: true,
            errors: ['Username cannot be \'username\'!'],
        }).toJS();
    expect.assertions(1);
    await store.dispatch(showErrorsAction);
    expect(store.getState()).toEqual(expected);
});

test('FIELD_SHOW_ERRORS (true)', async () => {
    const showErrorsAction = creators.showFieldErrors('userName', true);
    const expected = fromJS(initialState)
        .mergeIn(['asyncForm', 'fields', 'userName'], {
            showErrors: true,
            errors: ['Username cannot be \'username\'!'],
        }).toJS();
    expect.assertions(1);
    await store.dispatch(showErrorsAction);
    expect(store.getState()).toEqual(expected);
});

test('FIELD_SHOW_ERRORS (false)', () => {
    const showAction = creators.showFieldErrors('userName');
    const hideAction = creators.showFieldErrors('userName', false);
    store.dispatch(showAction);
    const expected = fromJS(store.getState())
        .setIn(['asyncForm', 'fields', 'userName', 'showErrors'], false)
        .toJS();
    evaluateAction(store)(hideAction, expected);
});