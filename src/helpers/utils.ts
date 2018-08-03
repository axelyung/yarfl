// tslint:disable:variable-name no-var-requires
const _camelCase = require('lodash/camelCase');
const _capitalize = require('lodash/capitalize');
const _get = require('lodash/get');
const _kebabCase = require('lodash/kebabCase');
const _merge = require('lodash/merge');
const _pick = require('lodash/pick');
const _cloneDeep = require('lodash/cloneDeep');
const _set = require('lodash/set');
// tslint:enable:variable-name no-var-requires

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

export const firstDefined = (...args: any[]) => {
    for (const i in args) {
        if (typeof args[i] !== 'undefined' && args[i] !== null) {
            return args[i];
        }
    }
};

const caseFnWrapper = (fn: (str: string) => string) => (str: string) => {
    return fn(str.replace(/(\d+)/, ' $1 '));
};

export const capitalize = caseFnWrapper((str: string) => {
    const words = _kebabCase(str).split('-');
    return [_capitalize(words[0]), ...words.slice(1)].join(' ');
});

export const titleCase = caseFnWrapper((str: string) => {
    return _kebabCase(str).split('-').map(_capitalize).join(' ');
});

export const kebabCase = caseFnWrapper(_kebabCase);

export const camelCase = caseFnWrapper(_camelCase);

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

export const removeAt = <T>(arr: T[], index: number, count = 1) => [
    ...arr.slice(0, index),
    ...arr.slice(index + count),
];

export const getIn = (obj: object | any[], path: (string|number)[]) => _get(obj, path);

export const setInWithKey = <T extends object>(state: T, key: string, target: string, value: any) => {
    const fieldPath = ['fields', ...parseKey(key), target];
    const result = setInWithPath(state, fieldPath, value) as T;
    return result;
};

export const setInWithPath = <T extends object>(obj: T, path: (string|number)[], value: any) => {
    return _set(_cloneDeep(obj), path, value) as T;
};

export const mergeIn = <T extends object>(state: T, key: string, value: object): T => {
    const fieldPath = ['fields', ...parseKey(key)];
    const target = getIn(state, fieldPath);
    const merged = _merge(target, value);
    return setInWithPath(state, fieldPath, merged) as T;
};

export const mergeDeep = (obj1: object, obj2: object) => _merge(obj1, obj2);

export const mergeDeepIn = <T extends object>(state: T, key: string, value: object) => {
    const fieldPath = ['fields', ...parseKey(key)];
    const target = getIn(state, fieldPath);
    const merged = _merge(target, value);
    return setInWithPath(state, fieldPath, merged) as T;
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
        throwError(
            `The given key '${key || path.join('.')}' does not correspond`,
            `to a defined part of the state tree. Please check that the key is valid`,
        );
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

export const logWarning = (...errorMessage: string[]) => {
    console.warn(`YARFL: ${errorMessage.join(' ')}`);
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
    return _pick(target, props) as Partial<T>;
};
