import * as R from 'ramda';
import { Action, applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import { init } from 'src';
import { Config, FieldProps, FormProps } from 'src/typings';

// tslint:disable:no-console
export const getIn = <T>(obj: object | any[], path: string | (string|number)[]) => {
    const fieldPath = typeof path === 'string'
        ? parseKey(path)
        : path;
    return R.path<T>(fieldPath, obj);
};

const regex = /\[\d+\]/;

const parseKey = (key: string) => {
    if (key.includes('.') || regex.test(key)) {
        const split = key.split('.')
            .reduce((acc: any[], curr) => {
                const match = regex.test(curr) && curr.match(/\[(\d+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    const noIndex = curr.replace(regex, '');
                    return [...acc, noIndex, index];
                }
                return [...acc, curr];
            }, []);
        return split;
    }
    return [key];
};

export const mergeIn = <T extends object>(state: T, path: string | (string|number)[], value: object): T => {
    const fieldPath = typeof path === 'string'
        ? parseKey(path)
        : path;
    const target = getIn(state, fieldPath);
    const merged = R.merge(target, value);
    return R.assocPath(fieldPath, merged, state);
};

export const setIn = <T extends object>(state: T, path: string | (string|number)[], value: any): T => {
    const fieldPath = typeof path === 'string'
        ? parseKey(path)
        : path;
    return R.assocPath(fieldPath, value, state);
};

export const mergeDeep = R.mergeDeepRight;

export const mergeDeepIn = <T extends object>(state: T, path: string | (string|number)[], value: object) => {
    const fieldPath = typeof path === 'string'
        ? parseKey(path)
        : path;
    const target = getIn(state, fieldPath);
    const merged = mergeDeep(target, value);
    return R.assocPath(fieldPath, merged, state);
};

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

export const expectToThrow = (fn: () => any) => expect(fn).toThrow(/^YARFL: /);

export const evaluateActions = (store: Store) => async (actions: Action | Action[], expected: object) => {
    expect.assertions(1);
    if (Array.isArray(actions)) {
        for (const a of actions) {
            await store.dispatch(a);
        }
    } else {
        await store.dispatch(actions);
    }
    const reduction = store.getState();
    expect(reduction).toEqual(expected);
    return reduction;
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

export const createTestAssets = (config: Config) => {
    const initResult = init(config);
    const store = createStore(initResult.reducer, initResult.initialState, applyMiddleware(thunk));
    return { store, ...initResult };
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const checkFormProps = (props: FormProps<any>) => {
    const size = Object.keys(props).length;
    expect(size > 10).toBe(true);
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
    [set, clear, reset, select, showErrors, propsExtract, bind].map(fn => expectFunction(fn));
    expectArray(errors);
    expectNumber(errorCount);
    expectBoolean(valid);
    expectObject(values);
};

export const checkFieldProps = (props: FieldProps) => {
    expect(props).toBeDefined();
    const size = Object.keys(props).length;
    expect(size > 8).toBe(true);
    expect(props).toBeDefined();
    const {
        set,
        clear,
        reset,
        showErrors,
        bind,
        errors,
        errorCount,
        errorMessage,
        valid,
    } = props;
    [set, clear, reset, showErrors, bind].map(fn => expectFunction(fn));
    expectArray(errors);
    expectNumber(errorCount);
    expectString(errorMessage);
    expectBoolean(valid);
};