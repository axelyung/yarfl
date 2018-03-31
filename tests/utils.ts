import { Action, applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import { init } from 'src';
import { Config } from 'src/types';

const expectType = (target: any, type: string) => {
    expect(typeof target).toEqual(type);
};

export const expectFunction = (target: any, length?: number) => {
    expectType(target, 'function');
    if (length) {
        expect(target).toHaveLength(length);
    }
};

export const expectObject = (target: any) => expectType(target, 'object');

export const expectString = (target: any) => expectType(target, 'string');

export const expectNumber = (target: any) => expectType(target, 'number');

export const expectBoolean = (target: any) => expectType(target, 'boolean');

export const expectArray = (target: any) => expect(Array.isArray(target)).toBe(true);

export const expectToThrow = (fn: () => any) => expect(fn).toThrow(/^REDUX VALIDATED: /);

export const evaluateAction = (store: Store) => (action: Action, expected: object) => {
    store.dispatch(action);
    const reduction = store.getState();
    expect(reduction).toEqual(expected);
};

export const evaluateActionAsync = (store: Store) => async (action: Action, expected: object) => {
    expect.assertions(1);
    await store.dispatch(action);
    const reduction = store.getState();
    expect(reduction).toEqual(expected);
};

export const printObj = (obj: object) => console.log(JSON.stringify(obj, null, 4));

const significantValues = 6;
const roundConstant = Math.pow(10, significantValues);

export const timer = (fn: () => any, name?: string) => {
    const t0 = performance.now();
    const result = fn();
    const time = Math.round(roundConstant * (performance.now() - t0)) / roundConstant;
    if (name) {
        console.log(`TIMER: Call to ${name} took ${time} milliseconds.`);
    } else {
        console.log(`TIMER: Call took ${time} milliseconds.`);
    }
    return result;
};

export const createTestStore = (config: Config) => {
    const initResult = init(config);
    const store = createStore(initResult.reducer, initResult.initialState, applyMiddleware(thunk));
    return { store, initResult };
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));