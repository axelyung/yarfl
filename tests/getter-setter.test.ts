import { combineReducers, createStore } from 'redux';
import { init } from 'src';
import { Action } from 'src/typings';
import { hybridConfig, hybridState } from './configs/hybrid';
import { mountLocalForm } from './helpers/components';
import { mergeIn } from './helpers/utils';

const config = mergeIn(hybridConfig, 'fields.basicField', {
    getter: (str: string) => str.split('').reverse().join(''),
    setter: (str: string) => str.split('').reverse().join(''),
    value: 'initial',
});

const initState = mergeIn(hybridState, 'hybridForm.fields.basicField', {
    value: 'initial',
    initial: 'initial',
    errors: [],
});

describe('For fields with a getter/setter', () => {
    let wrapper, getState, getFormProps;
    beforeEach(() => {
        const props = mountLocalForm(config);
        wrapper = props.wrapper;
        getState = props.getState;
        getFormProps = props.getFormProps;
    });

    it('should have no affect on initial state', () => {
        expect(getState()).toEqual(initState);
    });

    it('should use setter with onChange(e)', () => {
        const { onChange } = getFormProps().select('basicField').bind();
        onChange({ currentTarget: { value: 'reverse' } });
        expect(getState().hybridForm.fields.basicField.value).toEqual('esrever');
    });

    it('should use setter with onChange(null, e)', () => {
        const { onChange } = getFormProps().select('basicField').bind();
        onChange(null, 'reverse');
        expect(getState().hybridForm.fields.basicField.value).toEqual('esrever');
    });

    it('should not use setter with set()', () => {
        const { set } = getFormProps().select('basicField');
        set('no_reverse');
        expect(getState().hybridForm.fields.basicField.value).toEqual('no_reverse');
    });

    it('should use getter with select().bind().value', () => {
        const { value } = getFormProps().select('basicField').bind();
        expect(value).toEqual('laitini');
    });

    it('should not use getter with select().value', () => {
        const { value } = getFormProps().select('basicField');
        expect(value).toEqual('initial');
    });
});
