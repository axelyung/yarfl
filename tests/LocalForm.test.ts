import { extract } from 'src/helpers/utils';
import { InputEvent } from 'src/typings';
import { hybridConfig, hybridState, shallowConfig, shallowState } from './configs';
import { mountLocalForm, PropsTarget } from './helpers/components';
import {
    checkFieldProps,
    checkFormProps,
    expectToThrow,
    mergeDeepIn,
    mergeIn,
    setIn,
    timer,
} from './helpers/utils';

describe(`When changing the 'config' prop for LocalForm`, () => {
    it('should reinitialize the form if config changed', () => {
        const { wrapper, getState } = mountLocalForm(hybridConfig);
        expect(getState()).toEqual(hybridState);
        wrapper.setProps({ config: shallowConfig });
        expect(getState()).toEqual({
            hybridState: undefined,
            ...shallowState,
        });
    });

    it('should have no effect if config is the same', () => {
        const { wrapper, getState, getFormProps } = mountLocalForm(hybridConfig);

        // update config prop
        wrapper.setProps({ config: hybridConfig });
        expect(getState()).toEqual(hybridState);

        // update basicField value
        getFormProps().set({ basicField: 'updated' });
        const stateAfterUpdate = getState();
        wrapper.setProps({ config: hybridConfig });
        expect(getState()).toEqual(stateAfterUpdate);
    });
});
