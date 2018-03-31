import { fromJS } from 'immutable';
import { arrayConfig } from 'tests/configs';
import { createTestStore, evaluateAction } from 'tests/utils';

describe('When dispatching actions to the store', () => {
    const init = createTestStore(arrayConfig);
    let store = init.store;
    const { initialState, actionCreators } = init.initResult;
    const creators = actionCreators.arrayForm;

    beforeEach(() => {
        store = createTestStore(arrayConfig).store;
    });

    it('ARRAY_FIELD_ADD', () => {
        const action = creators.addArrayField('field1');
        const firstNewField = fromJS((initialState.arrayForm.fields.field1 as any).default).mergeDeep({
            nestedField1: {
                key: 'nestedField1[1]',
                name: 'field1[][nestedField1]',
                id: 'nested-field-1-1',
            },
            nestedField2: {
                key: 'nestedField2[1]',
                name: 'field1[][nestedField2]',
                id: 'nested-field-2-1',
            },
        }).toJS();
        const expected1 = fromJS(initialState)
            .updateIn(['arrayForm', 'fields', 'field1', 'fields'], arr => arr.push(firstNewField))
            .toJS();

        evaluateAction(store)(action, expected1);

        const secondNewField = fromJS((initialState.arrayForm.fields.field1 as any).default).mergeDeep({
            nestedField1: {
                key: 'nestedField1[2]',
                name: 'field1[][nestedField1]',
                id: 'nested-field-1-2',
            },
            nestedField2: {
                key: 'nestedField2[2]',
                name: 'field1[][nestedField2]',
                id: 'nested-field-2-2',
            },
        }).toJS();
        const expected2 = fromJS(expected1)
            .updateIn(['arrayForm', 'fields', 'field1', 'fields'], arr => arr.push(secondNewField))
            .toJS();

        evaluateAction(store)(action, expected2);
    });

    it('ARRAY_FIELD_DELETE', () => {
        const addAction = creators.addArrayField('field1');
        store.dispatch(addAction);
        const deleteAction = creators.deleteArrayField('field1', 1);
        store.dispatch(deleteAction);

        evaluateAction(store)(deleteAction, initialState);
    });
});

    // it.skip('FIELD_UPDATE (array)', () => {
    //     const action = creators.updateField('field1[0].nestedField1', 'updated value');
    //     const expected = fromJS(initialState)
    //         .mergeIn(['arrayForm', 'fields', 'field1'], {
    //             touched: true,
    //             changed: true,
    //         }).mergeIn(['arrayForm', 'fields', 'field1', 'fields', 0, 'nestedField1'], {
    //             value: 'updated value',
    //             touched: true,
    //             changed: true,
    //         }).toJS();
    //     evaluateAction(store)(action, expected);
    // });

    // test.skip('FIELD_FOCUSED', () => {
    //     const action = {
    //         type: actionTypes.FIELD_FOCUSED,
    //         key: 'field1',
    //     };
    //     const reduction = reducer(testState, action);
    //     const expected = fromJS(testState).mergeDeep({
    //     field1: {
    //         focused: true,
    //     },
    // }).toJS();

    //     expect(reduction).toEqual(expected);
    // });

    // test.skip('FIELD_FOCUSED (nested)', () => {
    //     const action = {
    //         type: actionTypes.FIELD_FOCUSED,
    //         key: 'field3.nestedField1',
    //     };
    //     const reduction = reducer(testState, action);
    //     const expected = fromJS(testState).mergeDeep({
    //     field3: {
    //         focused: true,
    //         fields: {
    //             nestedField1: {
    //                 focused: true,
    //             },
    //         },
    //     },
    // }).toJS();
    //     expect(reduction).toEqual(expected);
    // });

    // test.skip('FIELD_BLURRED', () => {
    //     const action = {
    //         type: actionTypes.FIELD_BLURRED,
    //         key: 'field1',
    //     };
    //     const reduction = reducer(testState, action);
    //     const expected = fromJS(testState).mergeDeep({
    //     field1: {
    //         focused: false,
    //         touched: true,
    //         showErrors: true,
    //     },
    // }).toJS();

    //     expect(reduction).toEqual(expected);
    // });

    // test.skip('FIELD_BLURRED (nested)', () => {
    //     const action = {
    //         type: actionTypes.FIELD_BLURRED,
    //         key: 'field3.nestedField1',
    //     };
    //     const reduction = reducer(testState, action);
    //     const expected = fromJS(testState).mergeDeep({
    //     field3: {
    //         focused: false,
    //         touched: true,
    //         fields: {
    //             nestedField1: {
    //                 focused: false,
    //                 touched: true,
    //                 showErrors: true,
    //             },
    //         },
    //     },
    // }).toJS();
    //     expect(reduction).toEqual(expected);
    // });

    // test.skip('FIELD_CLEAR', () => {
    //     const action = {
    //         type: actionTypes.FIELD_CLEAR,
    //         key: 'field1',
    //     };
    //     const reduction = reducer(testState, action);
    //     const expected1 = fromJS(testState).mergeDeep({
    //     field1: {
    //         value: '',
    //     },
    // }).toJS();
    //     expect(reduction).toEqual(expected1);
    // });

    // test.skip('FIELD_CLEAR (nested)', () => {
    //     const action = {
    //         type: actionTypes.FIELD_CLEAR,
    //         key: 'field3.nestedField1',
    //     };
    //     const reduction = reducer(testState, action);
    //     const expected1 = fromJS(testState).mergeDeep({
    //     field3: {
    //         fields: {
    //             nestedField1: {
    //                 value: '',
    //             },
    //         },
    //     },
    // }).toJS();
    //     expect(reduction).toEqual(expected1);
    // });

    // test.skip('FIELD_RESET', () => {
    //     const updateAction = {
    //         type: actionTypes.FIELD_UPDATE,
    //         key: 'field1',
    //         value: 'updated',
    //     };
    //     const updatedState = reducer(testState, updateAction);
    //     const blurAction = {
    //         type: actionTypes.FIELD_BLURRED,
    //         key: 'field1',
    //     };
    //     const blurredState = reducer(updatedState, blurAction);
    //     const resetAction = {
    //         type: actionTypes.FIELD_RESET,
    //         key: 'field1',
    //     };
    //     const resetState = reducer(blurredState, resetAction);
    //     const expectedResult = fromJS(testState).mergeDeep({
    //     field1: {
    //         value: testState.field1.default,
    //     },
    // }).toJS();
    //     expect(resetState).toMatchObject(expectedResult);
    // });

    // test.skip('FIELD_RESET (nested)', () => {
    //     const updateAction = {
    //         type: actionTypes.FIELD_UPDATE,
    //         key: 'field3.nestedField1',
    //         value: 'changed value',
    //     };
    //     const updatedState = reducer(testState, updateAction);
    //     const blurAction = {
    //         type: actionTypes.FIELD_BLURRED,
    //         key: 'field3.nestedField1',
    //     };
    //     const blurredState = reducer(testState, updateAction);
    //     const resetAction = {
    //         type: actionTypes.FIELD_RESET,
    //         key: 'field3.nestedField1',
    //     };
    //     const reduction = reducer(blurredState, resetAction);
    //     const defaultValue = testState.field1.default;
    //     const expectedResult = fromJS(testState).mergeDeep({
    //     field3: {
    //         touched: false,
    //         showErrors: false,
    //         changed: false,
    //         fields: {
    //             nestedField1: {
    //                 value: testState.field3.fields.nestedField1.default,
    //                 touched: false,
    //                 showErrors: false,
    //                 changed: false,
    //             },
    //         },
    //     },
    // }).toJS();
    //     expect(reduction).toMatchObject(expectedResult);
    // });

    // test.skip('FIELD_SHOW_ERRORS (void)', () => {
    //     const action = {
    //         type: actionTypes.FIELD_SHOW_ERRORS,
    //         key: 'field1',
    //     };
    //     const reduction = reducer(testState, action);
    //     const expectation = fromJS(testState).mergeDeep({
    //     field1: {
    //         showErrors: true,
    //     },
    // }).toJS();
    //     expect(reduction).toMatchObject(expectation);
    // });

    // test.skip('FIELD_SHOW_ERRORS (true)', () => {
    //     const action = {
    //         type: actionTypes.FIELD_SHOW_ERRORS,
    //         key: 'field1',
    //         value: true,
    //     };
    //     const reduction = reducer(testState, action);
    //     const expectation = fromJS(testState).mergeDeep({
    //     field1: {
    //         showErrors: true,
    //     },
    // }).toJS();
    //     expect(reduction).toMatchObject(expectation);
    // });

    // test.skip('FIELD_SHOW_ERRORS (false)', () => {
    //     const action = {
    //         type: actionTypes.FIELD_SHOW_ERRORS,
    //         key: 'field1',
    //         value: false,
    //     };
    //     const reduction = reducer(testState, action);
    //     const expectation = fromJS(testState).mergeDeep({
    //     field1: {
    //         showErrors: false,
    //     },
    // }).toJS();
    //     expect(reduction).toMatchObject(expectation);
    // })};
    //
