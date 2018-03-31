import * as R from 'ramda';
import {
    CompleteConfig,
    Config,
    FieldState,
    FieldType,
    FormState,
    Model,
    ParentFieldState,
    SimpleFieldState,
    } from '../types';
import { checkPath } from './checkers';

export const firstDefined = (...args: any[]) => {
    for (const i in args) {
        if (typeof args[i] !== 'undefined') {
            return args[i];
        }
    }
    return undefined;
};

const caseFnWrapper = (fn: (str: string) => string) => (str: string) => {
    const seperated = str.replace(/(\d+)/, ' $1 ');
    return fn(seperated);
};

// tslint:disable:no-var-requires
export const capitalize = caseFnWrapper(require('sentence-case'));

export const titleCase = caseFnWrapper(require('title-case'));

export const kebabCase = caseFnWrapper(require('param-case'));

export const camelCase = caseFnWrapper(require('camel-case'));
// tslint:enable:no-var-requires

export const addDefaultsToConfig = <S extends object>(config: Config<S>): CompleteConfig<S> => {
    return {
        // useLang?: string;
        method: 'POST',
        customRules: [],
        errorMessages: {},
        validateOnInit: true,
        validateOnFocus: false,
        validateOnBlur: true,
        validateOnChange: false,
        validateOnClear: false,
        validateOnReset: false,
        showErrorsOnInit: false,
        showErrorsOnFocus: false,
        showErrorsOnBlur: true,
        showErrorsOnChange: false,
        showErrorsOnClear: false,
        showErrorsOnReset: false,
        autoParseNumbers: true,
        skipDefaults: false,
        mapState: (state: any) => state[config.name],
        ...config,
    } as CompleteConfig<S>;
};

export const isNonEmptyArray = (test: any) => !!(test && Array.isArray(test) && test.length);

const regex = /\[\d+\]/;

export const parseKey = (key: string, endWith?: string | string[]) => {
    if (key.includes('.') || regex.test(key) || endWith) {
        const split = key.split('.')
            .reduce((acc: any[], curr, currIndex, splitArr) => {
                const match = regex.test(curr) && curr.match(/\[(\d+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    const noIndex = curr.replace(regex, '');
                    return [...acc, noIndex, 'fields', index];
                }
                return currIndex < splitArr.length - 1
                    ? [...acc, curr, 'fields']
                    : [...acc, curr];
            }, []);
        return endWith ? split.concat(endWith) : split;
    }
    return [key];
};

export const removeAt = <T>(arr: T[], index: number, count = 1) => R.remove(index, count, arr);

export const append = <T>(arr: T[], value: T) => R.append(value, arr);

export const getIn = <T>(obj: object | any[], path: (string|number)[]) => R.path<T>(path, obj);

export const setInWithKey = <T>(state: T, key: string, target: string, value: any) => {
    const fieldPath = ['fields', ...parseKey(key), target];
    return R.assocPath(fieldPath, value, state);
};

export const setInWithPath = <T>(obj: T, path: (string|number)[], value: any) => R.assocPath(path, value, obj);

export const mergeIn = <T extends object>(state: T, key: string, value: object): T => {
    const fieldPath = ['fields', ...parseKey(key)];
    const target = getIn(state, fieldPath);
    const merged = R.merge(target, value);
    return R.assocPath(fieldPath, merged, state);
};

export const mergeDeep = R.mergeDeepRight;

export const mergeDeepIn = <T extends object>(state: T, key: string, value: object) => {
    const fieldPath = ['fields', ...parseKey(key)];
    const target = getIn(state, fieldPath);
    const merged = mergeDeep(target, value);
    return R.assocPath(fieldPath, merged, state);
};

// recursively merges value up the state tree
export const mergeUp = <T extends object>(state: T, key: string, value: object) => {
    const updated = mergeIn(state, key, value);
    if (key.includes('.')) {
        const path = key.split('.');
        const nextKey = path.slice(0, path.length - 1).join('.');
        return mergeUp(updated as any, nextKey, value);
    }
    return updated;
};

export const selectField = <T extends FormState | CompleteConfig>(target: T, key: string) => {
    const path = ['fields', ...parseKey(key)];
    const field = getIn(target, path);
    if (typeof field === 'undefined') {
        checkPath(path, target, key);
    }
    return field as any;
};

export const extract = <S extends object>(fields: Model<S, FieldState>, key: keyof SimpleFieldState,
    options?: { ignoreEmptyStrings?: boolean, flatten?: boolean }): object => {
    const defaultOptions = { ignoreEmptyStrings: false, flatten: false };
    const optionsWithDefaults = { ...defaultOptions, ...options };
    const extraction = Object.entries<FieldState>(fields)
        .reduce<object>((acc, [k, entry]: [string, FieldState]) => {
            switch (entry.fieldType) {
                case FieldType.Simple:
                    const value = (entry as SimpleFieldState)[key];
                    const { ignoreEmptyStrings } = optionsWithDefaults;
                    const skip = ignoreEmptyStrings && value === '';
                    return skip ? acc : { ...acc, [k]: value };
                case FieldType.Parent:
                    const entryFields = (entry as ParentFieldState).fields;
                    const node = extract(entryFields, key, options);
                    return { ...acc, [k]: node };
                case FieldType.Array:
                // TODO:
                    return {};
            }
            return {};
        }, {}) as S;
    return optionsWithDefaults.flatten
        ? flatten(extraction)
        : extraction;
};

export const throwError = (...errorMessage: string[]) => {
    throw new Error(`REDUX VALIDATED: ${errorMessage.join(' ')}`);
};

export const logError = (...errorMessage: string[]) => {
    console.error(`REDUX VALIDATED: ${errorMessage.join(' ')}`);
};

export const flatten = (obj: object) => _flatten(obj);

// tslint:disable-next-line:variable-name
const _flatten = (obj: object, prefix?: string): object => {
    return Object.entries(obj).reduce((acc, [key, entry]: [string, any]) => {
        const k = prefix ? `${prefix}.${key}` : key;
        if (typeof entry === 'object' && !Array.isArray(entry)) {
            return { ...acc, ..._flatten(entry, k) };
        }
        return { ...acc, [k]: entry };
    }, {});
};

export const pick = <T extends object>(target: T, props: (keyof T & string)[]) => {
    return R.pick(props, target);
};

export const omit = <T extends object>(target: T, props: (keyof T & string)[]) => {
    return R.omit(props, target);
};

export const isPromise = (target: any) => {
    if (Promise && Promise.resolve) {
        return Promise.resolve(target) === target;
    }
    throw new Error('Promise not supported in your environment');
};