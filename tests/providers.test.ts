import { extract } from 'src/helpers/utils';
import { InputEvent } from 'src/typings';
import { hybridConfig, hybridState } from './configs/hybrid';
import {
    mountGenericConnectedComponent,
    mountGenericFormProviderComponent,
    mountLocalForm,
    mountNamedConnectedComponent,
    mountNamedFormProviderComponent,
} from './helpers/components';
import { checkArrayField, checkParentField } from './helpers/utils';
import {
    checkFormProps,
    checkSimpleField,
    expectToThrow,
    mergeDeepIn,
    mergeIn,
    setIn,
    timer,
} from './helpers/utils';

const providers = {
    LocalForm: mountLocalForm,
    FormProvider: mountGenericFormProviderComponent,
    connect: mountGenericConnectedComponent,
    'FormProvider.named': mountNamedFormProviderComponent,
    'connect.named': mountNamedConnectedComponent,
};

Object.entries(providers).forEach(([name, mounter]) => {
    timer(() => {
        describe(`For ${name} component`, () => {
            let component = mounter(hybridConfig);

            beforeEach(() => {
                component = mounter(hybridConfig);
            });

            it('should mount with initState equal to state', () => {
                expect(component.getState()).toEqual(hybridState);
            });

            it('should recieve props', () => {
                checkFormProps(component.getFormProps());
            });

            it('value prop should match state values', () => {
                const { fields } = hybridState.hybridForm;
                const values = extract(fields as any, 'value');
                expect(component.getFormProps().values).toEqual(values);
            });

            it('formProp select() should throw when given invalid key', () => {
                expectToThrow(() => component.getFormProps().select('invalidKey'));
            });

            // TODO write test for other fields
            it(`formProp select() should return field props when given valid key`, () => {
                const { select } = component.getFormProps();
                checkSimpleField(select('basicField'));
                checkParentField(select('parent'));
                checkSimpleField(select('parent.child1'));
                checkParentField(select('parent.child2'));
                checkSimpleField(select('parent.child2.grandchild1'));
                checkSimpleField(select('parent.child2.grandchild2'));
                checkArrayField(select('arrayField'));
                checkSimpleField(select('arrayField[0].arrayField1'));
                checkSimpleField(select('arrayField[0].arrayField2'));
            });

            it(`chaining select() should return field props when given valid keys`, () => {
                const parent = component.getFormProps().select('parent');
                checkParentField(parent);
                checkSimpleField(parent.select('child1'));
                expectToThrow(() => parent.select('invalidKey'));
                const child2 = parent.select('child2');
                checkParentField(child2);
                expectToThrow(() => child2.select('invalidKey'));
                checkSimpleField(child2.select('grandchild1'));
                checkSimpleField(child2.select('grandchild2'));
            });

            it('formProp set() should update state', () => {
                component.getFormProps().set({
                    basicField: 'changed',
                });
                const metaUpdated = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    value: 'changed',
                    touched: true,
                    changed: true,
                });
                const expectation = setIn(metaUpdated, 'hybridForm.fields.basicField.errors', []);
                expect(component.getState()).toEqual(expectation);
            });

            it('formProp clear() should clear state', () => {
                component.getFormProps().set({
                    basicField: 'changed',
                });
                component.getFormProps().clear();
                const merge = mergeDeepIn(hybridState, 'hybridForm.fields', {
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
                                        errors: [],
                                    },
                                },
                            },
                        },
                    },

                });
                const updateArrayField = mergeDeepIn(merge, 'hybridForm.fields.arrayField.fields[0].arrayField2', {
                    changed: true,
                    value: '',
                    errors: [
                        'The array field 2 field is required.',
                    ],
                });
                expect(component.getState()).toEqual(updateArrayField);
            });

            it('formProp reset() should reset state', () => {
                const { getFormProps, getState } = component;
                const { set, reset } = getFormProps();
                set({
                    basicField: 'changed',
                    parent: {
                        child2: {
                            grandchild1: 'changed',
                        },
                    },
                });
                reset();
                const arrayField1Updated = mergeDeepIn(hybridState, 'hybridForm.fields.arrayField.fields[0].arrayField1', {
                    value: 'default',
                    errors: [],
                });
                const arrayField2Updated = mergeIn(arrayField1Updated, 'hybridForm.fields.arrayField.fields[0].arrayField2', {
                    value: '',
                    errors: ['The array field 2 field is required.'],
                });
                const expectation = mergeDeepIn(arrayField2Updated, 'hybridForm.fields', {
                    basicField: {
                        value: 'default',
                        errors: [],
                    },
                    parent: {
                        fields: {
                            child2: {
                                fields: {
                                    grandchild1: {
                                        value: 'default',
                                    },
                                },
                            },
                        },
                    },
                });
                expect(getState()).toEqual(expectation);
            });

            it('formProp showErrors() should show form errors', () => {
                component.getFormProps().showErrors();
                const arrayFieldsUpdated = mergeDeepIn(hybridState, 'hybridForm.fields.arrayField.fields[0]', {
                    arrayField1: {
                        showErrors: true,
                    },
                    arrayField2: {
                        showErrors: true,
                    },
                });
                const expectation = mergeDeepIn(arrayFieldsUpdated, 'hybridForm.fields', {
                    basicField: {
                        showErrors: true,
                        errors: ['The basic field field is required.'],
                    },
                    parent: {
                        fields: {
                            child1: {
                                showErrors: true,
                                errors: ['The child 1 field is required.'],
                            },
                            child2: {
                                fields: {
                                    grandchild1: {
                                        showErrors: true,
                                        errors: ['The grandchild 1 format is invalid.'],
                                    },
                                    grandchild2: {
                                        showErrors: true,
                                    },
                                },
                            },
                        },
                    },
                });
                expect(component.getState()).toEqual(expectation);
            });

            it('formProp extract() should extract values', () => {
                const placeholders = component.getFormProps().extract('placeholder');
                expect(placeholders).toEqual({
                    arrayField: [{
                        arrayField1: 'Array Field 1',
                        arrayField2: 'Array Field 2',
                    }],
                    basicField: 'Field One',
                    parent: {
                        child1: 'Child 1',
                        child2: {
                            grandchild1: 'Grandchild 1',
                            grandchild2: 'Grandchild 2' },
                    },
                });

                const rules = component.getFormProps().extract('rules');
                expect(rules).toEqual({
                    basicField: 'required',
                    parent: {
                        child1: 'required',
                        child2: {
                            grandchild1: 'email',
                            grandchild2: '',
                        },
                    },
                    arrayField: [
                        {
                            arrayField1: 'required',
                            arrayField2: 'required|min:18',
                        },
                    ],
                });

                const ids = component.getFormProps().extract('id');
                expect(ids).toEqual({
                    basicField: 'field_1',
                    parent: {
                        child1: 'child-1',
                        child2: {
                            grandchild1: 'grandchild-1',
                            grandchild2: 'grandchild-2',
                        },
                    },
                    arrayField: [
                        {
                            arrayField1: 'array-field-1-0',
                            arrayField2: 'array-field-2-0',
                        },
                    ],
                });
            });

            it('formProp bind() should return form props', () => {
                const bindProps = component.getFormProps().bind();
                expect(bindProps).toEqual({
                    name: 'hybridForm',
                    method: 'POST',
                    action: 'http://api.com/endpoint',
                });
            });

            it('fieldProp set() should update value', () => {
                component.getFormProps().select('basicField').set('test');
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    changed: true,
                    touched: true,
                    value: 'test',
                    errors: [],
                });
                expect(component.getState()).toMatchObject(expectation);
            });

            it('fieldProp clear() should clear value', () => {
                component.getFormProps().select('basicField').set('test');
                component.getFormProps().select('basicField').clear();
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    changed: true,
                    touched: true,
                    value: '',
                });
                expect(component.getState()).toMatchObject(expectation);
            });

            it('fieldProp reset() should reset value', () => {
                component.getFormProps().select('basicField').set('test');
                component.getFormProps().select('basicField').reset();
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    value: 'default',
                    errors: [],
                });
                expect(component.getState()).toMatchObject(expectation);
            });

            it('fieldProp showErrors() should show errors', () => {
                component.getFormProps().select('basicField').showErrors();
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    showErrors: true,
                });
                expect(component.getState()).toMatchObject(expectation);
            });

            it('fieldProp bind() should return field props ', () => {
                const bindProps = component.getFormProps().select('basicField').bind();
                const { onChange, onBlur, onFocus, ...other } = bindProps;
                expect(other).toMatchObject({
                    value: '',
                    default: 'default',
                    id: 'field_1',
                    type: 'text',
                    label: 'Field 1',
                    placeholder: 'Field One',
                    name: 'basicField',
                    disabled: false,
                    autoFocus: false,
                    autoComplete: 'basicField',
                });
            });

            it('fieldProp bind().onChange should update state on event', () => {
                const fakeEvent = { currentTarget: { value: 'test' } } as InputEvent;
                component.getFormProps().select('basicField').bind().onChange(fakeEvent);
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    changed: true,
                    touched: true,
                    value: 'test',
                    errors: [],
                });
                expect(component.getState()).toMatchObject(expectation);
            });

            it('fieldProp bind().onChange should update state on value passed', () => {
                const fakeEvent = { currentTarget: { value: 'no' } } as InputEvent;
                component.getFormProps().select('basicField').bind().onChange(fakeEvent, 'test');
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    changed: true,
                    touched: true,
                    value: 'test',
                    errors: [],
                });
                expect(component.getState()).toMatchObject(expectation);
            });

            it('fieldProp bind().onFocus should update state ', () => {
                component.getFormProps().select('basicField').bind().onFocus();
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    focused: true,
                });
                expect(component.getState()).toMatchObject(expectation);
            });

            it('fieldProp bind().onBlur should update state ', () => {
                component.getFormProps().select('basicField').bind().onBlur();
                const expectation = mergeIn(hybridState, 'hybridForm.fields.basicField', {
                    touched: true,
                    showErrors: true,
                });
                expect(component.getState()).toMatchObject(expectation);
            });
        });
    }, `${name} provider`);
});
