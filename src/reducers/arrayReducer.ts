import types from '../actions/types';
import { checkActionForKey, checkActionForKeyAndIndex } from '../helpers/checkers';
import { getIn, parseKey, removeAt, setInWithPath } from '../helpers/utils';
import {
    ActionUnknown,
    ArrayFieldState,
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
    const target = getIn(state, targetPath);
    if (!target) {
        return state;
    }
    return setInWithPath(state, targetPath, [...target, newField]);
};

export const createNewField = <S extends object>(parentKey: string, template: Model<S, FieldState>, index: number) => {
    // check if it is proper type of field
    if (typeof template === 'undefined') {
        throw new Error();
    }
    return Object.entries(template).reduce((acc, [k, entry]) => {
        const { key: childKey, id } = entry as SimpleFieldState;
        const key = `[${index}].${childKey}`;
        return {
            ...acc,
            [k]: {
                ...entry,
                key,
                path: `${parentKey}${key}`,
                id: `${id}-${index}`,
                name: `${parentKey}[][${childKey}]`,
            },
        };
    }, {});
};

const createDeleteArrayFieldReducer = () => (state: FormState, action: ActionUnknown) => {
    const { key, index } = checkActionForKeyAndIndex(action);
    const fieldPath = parseKey(key);
    const targetPath = ['fields', ...fieldPath];
    const target = getIn(state, targetPath);
    if (!(target || {}).fields) {
        return state;
    }
    const updatedTarget = {
        ...target,
        fields: removeAt(target.fields, index),
    };
    const relabeledTarget = relabelFields(updatedTarget);
    return setInWithPath(state, targetPath, relabeledTarget);
};

const relabelFields = (fieldState: ArrayFieldState) => {
    const { fields, key: parentKey, default: template } = fieldState;
    const updatedFields = fields.map((field, index) => {
        return Object.entries(field).reduce((acc, [k, subField]) => {
            const { key: childKey, id } = template[k];
            const key = `[${index}].${childKey}`;
            return {
                ...acc,
                [k]: {
                    ...subField,
                    key,
                    path: `${parentKey}${key}`,
                    id: `${id}-${index}`,
                    name: `${parentKey}[][${childKey}]`,
                },
            };
        }, {});
    });
    return {
        ...fieldState,
        fields: updatedFields,
    };
};
