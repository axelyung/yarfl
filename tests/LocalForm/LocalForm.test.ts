import { configure, mount } from 'enzyme';
import * as Adapter15 from 'enzyme-adapter-react-15';
import * as Adapter16 from 'enzyme-adapter-react-16';
import { LocalForm } from 'es';
import { extract } from 'es/helpers/utils';
import { init } from 'es/init';
import { FormProps } from 'es/types';
import * as React from 'react';
import { config } from 'tests/configs/hybrid';
import {
  checkFieldProps,
  checkFormProps,
  expectToThrow,
  mergeDeepIn,
  mergeIn,
  timer,
} from 'tests/utils';

class PropsTarget extends React.Component<FormProps<any>>{
    public render() {
        return 'test';
    }
}

const adapters = [
    { adapter: new Adapter15() },
    { adapter: new Adapter16() },
];

const mountLocalForm = (config) => {
    const props = {
        config,
        render: (targetProps) => React.createElement(PropsTarget, targetProps),
    };
    const component = React.createElement(LocalForm, props);
    return mount(component);
};

const getState = (component) => component.state();
const getFormProps = (component) => component.find(PropsTarget).props();

adapters.forEach((adapter, index) => {
    configure(adapter);

    timer(() => {
        describe(`For form ${config.name}`, () => {
            let component, initState;

            beforeEach(() => {
                // console.log(init(config).initialState[config.name].fields);
                initState = init(config).initialState;
                component = mountLocalForm(config);
            });

            it('should mount with initState equal to state', () => {
                expect(getState(component)).toEqual(initState);
            });

            it('should recieve props', () => {
                checkFormProps(getFormProps(component));
            });

            it('value prop should match state values', () => {
                const { fields } = initState[config.name];
                const values = extract(fields, 'value');
                expect(getFormProps(component).values).toEqual(values);
            });

            it('formProp select() should throw when given invalid key', () => {
                expectToThrow(() => getFormProps(component).select('invalidKey'));
            });

            it('formProp select() should return field props when given valid key', () => {
                const fieldProps = getFormProps(component).select('basicField');
                expect(fieldProps).toBeDefined();
                checkFieldProps(fieldProps);
            });

            it('formProp set() should update state', () => {
                getFormProps(component).set({
                    basicField: 'changed',
                });
                const expectation = mergeIn(initState, 'myForm.fields.basicField', {
                    value: 'changed',
                    touched: true,
                    changed: true,
                });
                expect(getState(component)).toEqual(expectation);
            });

            it('formProp clear() should clear state', () => {
                getFormProps(component).set({
                    basicField: 'changed',
                });
                getFormProps(component).clear();
                const expectation = mergeDeepIn(initState, 'myForm.fields', {
                    basicField: {
                        touched: true,
                        changed: true,
                    },
                    parent: {
                        fields: {
                            child2: {
                                fields: {
                                    grandchild1: {
                                        changed: true,
                                        value: '',
                                    },
                                },
                            },
                        },
                    },
                });
                expect(getState(component)).toEqual(expectation);
            });

            it.skip('formProp reset() should reset state', () => {
                getFormProps(component).set({
                    basicField: 'changed',
                });
                getFormProps(component).reset();
                const expectation = mergeDeepIn(initState, 'myForm.fields', {
                    basicField: {
                        value: 'default',
                    },
                    parent: {
                        fields: {
                            child2: {
                                fields: {
                                    grandchild1: {
                                        changed: true,
                                        value: '',
                                    },
                                },
                            },
                        },
                    },
                });
                expect(getState(component)).toEqual(expectation);
            });

            it.skip('formProp showErrors() should show form errors', () => {
                getFormProps(component).showErrors();
                const expectation = mergeDeepIn(initState, 'myForm.fields.basicField', {
                    showErrors: true,
                    errors: ['The field 1 field is required.'],
                });
                expect(getState(component)).toEqual(expectation);
            });

            // it('formProp extract() should extract values', () => {
            //     const placeholders = formProps.extract('placeholder');
            //     expect(placeholders).toEqual({ field1: 'Field One', field2: 'Field 2' });

            //     const rules = formProps.extract('rules');
            //     expect(rules).toEqual({ field1: 'required', field2: '' });

            //     const id = formProps.extract('id');
            //     expect(id).toEqual({ field1: 'field_1', field2: 'field-2' });
            // });

            // it('formProp bind() should return form props', () => {
            //     const bindProps = formProps.bind();
            //     expect(bindProps).toEqual({
            //         name: 'basicForm',
            //         method: 'POST',
            //         action: 'http://api.com/endpoint',
            //     });
            // });

            // it('fieldProp set() should update value', () => {
            //     formProps.select('field1').set('test');
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   changed: true,
            //   touched: true,
            //   value: 'test',
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });

            // it('fieldProp clear() should clear value', () => {
            //     formProps.select('field1').set('test');
            //     formProps.select('field1').clear();
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   changed: true,
            //   touched: true,
            //   value: '',
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });

            // it('fieldProp reset() should reset value', () => {
            //     formProps.select('field1').set('test');
            //     formProps.select('field1').reset();
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   value: 'default value',
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });

            // it('fieldProp showErrors() should show errors', () => {
            //     formProps.select('field1').showErrors();
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   showErrors: true,
            //   errors: ['The field 1 field is required.'],
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });

            // it('fieldProp bind() should return field props ', () => {
            //     const bindProps = formProps.select('field1').bind();
            //     const { onChange, onBlur, onFocus, ...other } = bindProps;
            //     expect(other).toMatchObject({
            //         value: '',
            //         default: 'default value',
            //         id: 'field_1',
            //         type: 'text',
            //         label: 'Field 1',
            //         placeholder: 'Field One',
            //         name: 'field1',
            //         disabled: false,
            //         autoFocus: false,
            //         autoComplete: 'field1',
            //     });
            // });

            // it('fieldProp bind().onChange should update state on event', () => {
            //     const onChange = formProps.select('field1').bind().onChange;
            //     const fakeEvent = { currentTarget: { value: 'test' } } as InputEvent;
            //     onChange(fakeEvent);
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   changed: true,
            //   touched: true,
            //   value: 'test',
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });

            // it('fieldProp bind().onChange should update state on value passed', () => {
            //     const onChange = formProps.select('field1').bind().onChange;
            //     const fakeEvent = { currentTarget: { value: 'no' } } as InputEvent;
            //     onChange(fakeEvent, 'test');
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   changed: true,
            //   touched: true,
            //   value: 'test',
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });

            // it('fieldProp bind().onFocus should update state ', () => {
            //     formProps
            // .select('field1')
            // .bind()
            // .onFocus();
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   focused: true,
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });

            // it('fieldProp bind().onBlur should update state ', () => {
            //     formProps
            // .select('field1')
            // .bind()
            // .onBlur();
            //     const expectation = fromJS(initialState)
            // .mergeIn(['basicForm', 'fields', 'field1'], {
            //   touched: true,
            //   showErrors: true,
            //   errors: ['The field 1 field is required.'],
            // })
            // .toJS();
            //     expect(store.getState()).toMatchObject(expectation);
            // });
        });
    }, `LocalForm for React${index ? '16' : '15'}`);

});