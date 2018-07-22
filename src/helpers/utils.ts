import * as _append from 'ramda/src/append';
import * as _assocPath from 'ramda/src/assocPath';
import * as _merge from 'ramda/src/merge';
import * as _mergeDeepRight from 'ramda/src/mergeDeepRight';
import * as _omit from 'ramda/src/omit';
import * as _path from 'ramda/src/path';
import * as _pick from 'ramda/src/pick';
import * as _remove from 'ramda/src/remove';

const R = {
    assocPath: _assocPath,
    merge: _merge,
    mergeDeepRight: _mergeDeepRight,
    omit: _omit,
    pick: _pick,
    remove: _remove,
    append: _append,
    path: _path,
};

import {
    ArrayFieldState,
    CompleteConfig,
    FieldState,
    FieldType,
    FormState,
    Model,
    ParentFieldState,
    SimpleFieldState,
    } from '../typings';
import { checkPath } from './checkers';

export const firstDefined = (...args: any[]) => {
    for (const i in args) {
        if (typeof args[i] !== 'undefined' && args[i] !== null) {
            return args[i];
        }
    }
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
    const updated = !/\[\d+\]$/.test(key)
        ? mergeIn(state, key, value)
        : state;
    if (key.includes('.')) {
        const path = key.split('.');
        const nextKey = path.slice(0, path.length - 1).join('.');
        return mergeUp(updated as any, nextKey, value);
    }
    return updated;
};

export const selectField = <T extends FormState | CompleteConfig>(target: T, key: string, graceful = false) => {
    const path = ['fields', ...parseKey(key)];
    const field = getIn(target, path);
    if (typeof field === 'undefined' && !graceful) {
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
                case FieldType.Array:
                    const arrayFields = (entry as ArrayFieldState).fields;
                    const arr =  arrayFields.map(field => extract(field, key, options));
                    return { ...acc, [k]: arr };
                case FieldType.Parent:
                    const childFields = (entry as ParentFieldState).fields;
                    const node = extract(childFields, key, options);
                    return { ...acc, [k]: node };
                default:
                    // @ts-ignore
                    return { ...acc, [k]: extract(entry, key, options) };
            }
            return {};
        }, {}) as S;
    return optionsWithDefaults.flatten
        ? flattenObj(extraction)
        : extraction;
};

export const throwError = (...errorMessage: string[]) => {
    throw new Error(`YARFL: ${errorMessage.join(' ')}`);
};

export const logError = (...errorMessage: string[]) => {
    console.error(`YARFL: ${errorMessage.join(' ')}`);
};

export const flatten = (target: object| any[]) =>
    Array.isArray(target)
        ? flattenArray(target)
        : flattenObj(target);

const flattenArray = (arr: any[]) => arr.reduce((a, b) => {
    return Array.isArray(b)
        ? [...a, ...flattenArray(b)]
        : [...a, b];
}, []);

const flattenObj = (obj: object, prefix?: string): object => {
    return Object.entries(obj).reduce((acc, [key, entry]: [string, any]) => {
        const k = prefix ? `${prefix}.${key}` : key;
        if (isNonEmptyArray(entry)) {
            const map = entry.reduce((prev, next, index) => ({
                ...prev,
                [`${k}[${index}]`]: next,
            }), {});
            return { ...acc, ...flattenObj(map) };
        }
        if (typeof entry === 'object' && !Array.isArray(entry)) {
            return { ...acc, ...flattenObj(entry, k) };
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
