import { init } from 'es';
import { Action } from 'es/types';
import { combineReducers, createStore } from 'redux';
import {
    arrayConfig,
    arrayState,
    asyncConfig,
    asyncState,
    nestedConfig,
    nestedState,
    shallowConfig,
    shallowState,
    } from 'tests/configs';
import { expectFunction, expectObject, timer } from 'tests/utils';

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

timer(() => {

    describe('For each type of config object', () => {
        testObjects.forEach(({ config, state }) => {
            const { reducer, initialState, connect, FormProvider } = init(config);

            it('defined returns', () => {
                expectFunction(reducer);
                expectObject(initialState);
                expectFunction(connect);
                expectFunction(connect[config.name]);
                expectFunction(FormProvider);
                expectFunction(FormProvider[config.name]);
                expect(initialState).toEqual(state);
            });

            it('no action', () => {
                const reduction = reducer(initialState, {} as Action);
                expect(reduction).toEqual(initialState);
            });

            it('store creation', () => {
                const simpleStore = createStore(reducer, initialState);
                expect(simpleStore.getState()).toEqual(state);
            });

            it('extended store creation', () => {
                const extendedReducer = combineReducers({
                    forms: reducer,
                });
                const extendedState = {
                    forms: initialState,
                };
                const extendedStore = createStore(extendedReducer, extendedState);
                expect(extendedStore.getState()).toEqual(extendedState);
            });
        });
    });

    test('defined init return with multiple configs', () => {
        const { reducer, initialState, connect, FormProvider } = init(shallowConfig, nestedConfig);
        expect(typeof reducer).toBe('function');
        expect(typeof initialState).toBe('object');
        expect(typeof connect).toBe('function');
        expect(typeof connect.basicForm).toBe('function');
        expect(typeof FormProvider).toBe('function');
        expect(typeof FormProvider.basicForm).toBe('function');
        expect(initialState).toEqual({
            ...shallowState,
            ...nestedState,
        });
    });

    test('require unique form name(s)', () => {
        expect(() => init({} as any)).toThrow(/^REDUX VALIDATED: /);
        expect(() => init(shallowConfig, {} as any)).toThrow(/^REDUX VALIDATED: /);
        expect(() => init(shallowConfig, shallowConfig)).toThrow(/^REDUX VALIDATED: /);
    });

    test('store creation with multiple config', () => {
        const { reducer, initialState } = init(shallowConfig, nestedConfig);
        const { getState } = createStore(reducer, initialState);
        expect(getState()).toEqual({
            ...shallowState,
            ...nestedState,
        });
    });

    test('extended store creation with multiple config', () => {
        const { reducer, initialState } = init(shallowConfig, nestedConfig);
        const extendedReducer = combineReducers({
            forms: reducer,
        });
        const extendedState = {
            forms: initialState,
        };
        const { getState } = createStore(extendedReducer, extendedState);
        expect(getState()).toEqual({
            forms: {
                ...shallowState,
                ...nestedState,
            },
        });
    });
}, 'INIT');
