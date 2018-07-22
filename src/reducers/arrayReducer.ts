import types from '../actions/types';
import { checkActionForKey, checkActionForKeyAndIndex } from '../helpers/checkers';
import { append, getIn, parseKey, removeAt, setInWithPath } from '../helpers/utils';
import {
    ActionUnknown,
    FieldState,
    FormState,
    Model,
    SimpleFieldState,
    } from '../typings';

export const createArrayReducer = () =>
    (state: FormState, action: ActionUnknown) => {
        const { type } = action;
        switch (type) {
            case types.ARRAY_FIELD_ADD:
            case types.ARRAY_FIELD_DELETE:
                break;
            default:
                return state;
        }
        const checkedAction = checkActionForKey(action);
        switch (type) {
            case types.ARRAY_FIELD_ADD:
                return createAddArrayFieldReducer()(state, checkedAction);
            case types.ARRAY_FIELD_DELETE:
                return createDeleteArrayFieldReducer()(state, checkedAction);
            default:
                return state;
        }
    };

const createAddArrayFieldReducer = () => (state: FormState, action: ActionUnknown) => {
    const { key } = checkActionForKey(action);
    const fieldPath = parseKey(key);
    const { fields, default: template } = getIn(state, ['fields', ...fieldPath]) as any;
    const fieldKey = fieldPath.reverse()[0];
    const index = fields.length;
    const newField = createNewField(fieldKey, template, index);
    const targetPath = ['fields', ...fieldPath, 'fields'];
    const target = getIn<any[]>(state, targetPath);
    if (!target) {
        return state;
    }
    const updatedTarget = append(target, newField);
    return setInWithPath(state, targetPath, updatedTarget);
};

export const createNewField = <S extends object>(parentKey: string, template: Model<S, FieldState>, index: number) => {
    // check if it is proper type of field
    if (typeof template === 'undefined') {
        throw new Error();
    }
    return Object.entries(template).reduce((acc, [k, entry]) => {
        const { key: childKey, id } = entry as SimpleFieldState;
        return {
            ...acc,
            [k]: {
                ...entry,
                key: `${childKey}[${index}]`,
                id: `${id}-${index}`,
                name: `${parentKey}[][${childKey}]`,
            },
        };
    }, {});
};

const createDeleteArrayFieldReducer = () => (state: FormState, action: ActionUnknown) => {
    const { key, index } = checkActionForKeyAndIndex(action);
    const fieldPath = parseKey(key);
    const targetPath = ['fields', ...fieldPath, 'fields'];
    const target = getIn<any[]>(state, targetPath);
    if (!target) {
        return state;
    }
    const updatedTarget = removeAt(target, index);
    return setInWithPath(state, targetPath, updatedTarget);
};