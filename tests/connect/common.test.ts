import { configure } from 'enzyme';
import * as Adapter15 from 'enzyme-adapter-react-15';
import * as Adapter16 from 'enzyme-adapter-react-16';
import { extract } from 'es/helpers/utils';
import { init } from 'es/init';
import { FormProps } from 'es/types';
import { Store } from 'redux';
import { arrayConfig, arrayState, asyncConfig, asyncState, nestedConfig, nestedState, shallowConfig, shallowState } from 'tests/configs';
import {
  createTestStore,
  expectArray,
  expectBoolean,
  expectFunction,
  expectNumber,
  expectObject,
  expectToThrow,
  timer,
} from 'tests/utils';
import { mountAndReturnProps } from './TestComponent';

const checkProps = (props: any) => {
    const size = Object.keys(props).length;
    expect(size).toBe(11);
    expect(props).toBeDefined();
    const {
    set,
    clear,
    reset,
    select,
    showErrors,
    extract: propsExtract,
    bind,
    errors,
    errorCount,
    valid,
    values,
  } = props;
    [set, clear, reset, select, showErrors, propsExtract, bind].map(fn =>
    expectFunction(fn),
  );
    expectArray(errors);
    expectNumber(errorCount);
    expectBoolean(valid);
    expectObject(values);
};

const adapters = [
    { adapter: new Adapter15() },
    { adapter: new Adapter16() },
];

const testObjects = [{
    config: shallowConfig,
    state: shallowState,
}, {
    config: nestedConfig,
    state: nestedState,
}, {
    config: arrayConfig,
    state: arrayState,
}, {
    config: asyncConfig,
    state: asyncState,
}];

adapters.forEach((adapter, index) => {
    configure(adapter);

    timer(() => {
        testObjects.forEach(({ config, state }) => {
            describe(`For form ${config.name}`, () => {
                const { connect } = init(config);
                let store: Store, formProps: FormProps<any>;

                beforeEach(() => {
                    store = createTestStore(config).store;
                    formProps = mountAndReturnProps(store, connect)[config.name];
                });

                it('should recieve props', () => {
                    checkProps(formProps);
                });

                it('value prop should match state values', () => {
                    const { fields } = state[config.name];
                    const values = extract(fields, 'value');
                    expect(formProps.values).toEqual(values);
                });

                it('value prop should match store values', () => {
                    const { fields } = (store.getState() as any)[config.name];
                    const values = extract(fields, 'value');
                    expect(formProps.values).toEqual(values);
                });

                it('formProp select() should throw when given invalid key', () => {
                    expectToThrow(() => formProps.select('invalidKey'));
                });

            });
        });
    }, `CONNECT for React${index ? '16' : '15'}`);
});
