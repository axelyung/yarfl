import { configure } from 'enzyme';
import * as Adapter15 from 'enzyme-adapter-react-15';
import * as Adapter16 from 'enzyme-adapter-react-16';
import { fromJS } from 'immutable';
import { Store } from 'redux';
import { init } from 'src/init';
import { FormProps, InputEvent } from 'src/types';
import { nestedConfig } from 'tests/configs';
import { createTestStore } from '../utils';
import { mountAndReturnProps } from './TestComponent';

const adapters = [{ adapter: new Adapter15() }, { adapter: new Adapter16() }];

adapters.forEach(adapter => {
    configure(adapter);

    describe('When mounting a component with connect', () => {
        const { initialState, connect } = init(nestedConfig);
        let store: Store, formProps: FormProps<any>;
        beforeEach(() => {
            store = createTestStore(nestedConfig).store;
            formProps = mountAndReturnProps(store, connect).nestedForm;
        });

        it('formProp select() should return field props when given valid key', () => {
            expect(formProps.select('parent1')).toBeDefined();
            expect(formProps.select('parent1.child1')).toBeDefined();
            expect(formProps.select('parent1.child2.grandchild1')).toBeDefined();
        });

        it('formProp set() should update state (shallow)', () => {
            formProps.set({
                parent1: {
                    child1: 'changed',
                },
            });
            const expectation = fromJS(initialState)
                .mergeDeepIn(['nestedForm', 'fields', 'parent1'], {
                    touched: true,
                    changed: true,
                    fields: {
                        child1: {
                            value: 'changed',
                            touched: true,
                            changed: true,
                        },
                    },
                }).toJS();
            expect(store.getState()).toEqual(expectation);
        });

        it('formProp clear() should clear state', () => {
            formProps.set({
                parent1: {
                    child1: 'changed',
                    child2: {
                        grandchild1: 'changed',
                    },
                },
            });
            formProps.clear();
            const expectation = fromJS(initialState)
        .mergeDeepIn(['basicForm', 'fields'], {
          field1: {
            touched: true,
            changed: true,
          },
          field2: {
            touched: true,
            changed: true,
            value: '',
          },
        })
        .toJS();
            expect(store.getState()).toEqual(expectation);
        });

        it.skip('formProp reset() should reset state', () => {
            formProps.set({
                field1: 'changed',
                field2: 3,
            });
            formProps.reset();
            const expectation = fromJS(initialState)
        .mergeDeepIn(['basicForm', 'fields'], {
          field1: {
            value: 'default value',
          },
        })
        .toJS();
            expect(store.getState()).toEqual(expectation);
        });

        it.skip('formProp showErrors() should show form errors', () => {
            formProps.showErrors();
            const expectation = fromJS(initialState)
        .mergeDeepIn(['basicForm', 'fields'], {
          field1: {
            showErrors: true,
            errors: ['The field 1 field is required.'],
          },
          field2: {
            showErrors: true,
          },
        })
        .toJS();
            expect(store.getState()).toEqual(expectation);
        });

        it.skip('formProp extract() should extract values', () => {
            const placeholders = formProps.extract('placeholder');
            expect(placeholders).toEqual({ field1: 'Field One', field2: 'Field 2' });

            const rules = formProps.extract('rules');
            expect(rules).toEqual({ field1: 'required', field2: '' });

            const id = formProps.extract('id');
            expect(id).toEqual({ field1: 'field_1', field2: 'field-2' });
        });

        it.skip('formProp bind() should return form props', () => {
            const bindProps = formProps.bind();
            expect(bindProps).toEqual({
                name: 'basicForm',
                method: 'POST',
                action: 'http://api.com/endpoint',
            });
        });

        it.skip('fieldProp set() should update value', () => {
            formProps.select('field1').set('test');
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          changed: true,
          touched: true,
          value: 'test',
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });

        it.skip('fieldProp clear() should clear value', () => {
            formProps.select('field1').set('test');
            formProps.select('field1').clear();
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          changed: true,
          touched: true,
          value: '',
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });

        it.skip('fieldProp reset() should reset value', () => {
            formProps.select('field1').set('test');
            formProps.select('field1').reset();
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          value: 'default value',
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });

        it.skip('fieldProp showErrors() should show errors', () => {
            formProps.select('field1').showErrors();
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          showErrors: true,
          errors: ['The field 1 field is required.'],
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });

        it.skip('fieldProp bind() should return field props ', () => {
            const bindProps = formProps.select('field1').bind();
            const { onChange, onBlur, onFocus, ...other } = bindProps;
            expect(other).toMatchObject({
                value: '',
                default: 'default value',
                id: 'field_1',
                type: 'text',
                label: 'Field 1',
                placeholder: 'Field One',
                name: 'field1',
                disabled: false,
                autoFocus: false,
                autoComplete: 'field1',
            });
        });

        it.skip('fieldProp bind().onChange should update state on event', () => {
            const onChange = formProps.select('field1').bind().onChange;
            const fakeEvent = { currentTarget: { value: 'test' } } as InputEvent;
            onChange(fakeEvent);
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          changed: true,
          touched: true,
          value: 'test',
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });

        it.skip('fieldProp bind().onChange should update state on value passed', () => {
            const onChange = formProps.select('field1').bind().onChange;
            const fakeEvent = { currentTarget: { value: 'no' } } as InputEvent;
            onChange(fakeEvent, 'test');
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          changed: true,
          touched: true,
          value: 'test',
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });

        it.skip('fieldProp bind().onFocus should update state ', () => {
            formProps
        .select('field1')
        .bind()
        .onFocus();
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          focused: true,
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });

        it.skip('fieldProp bind().onBlur should update state ', () => {
            formProps
        .select('field1')
        .bind()
        .onBlur();
            const expectation = fromJS(initialState)
        .mergeIn(['basicForm', 'fields', 'field1'], {
          touched: true,
          showErrors: true,
          errors: ['The field 1 field is required.'],
        })
        .toJS();
            expect(store.getState()).toMatchObject(expectation);
        });
    });
});
