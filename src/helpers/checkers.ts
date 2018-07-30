import _get from 'lodash-es/get';
import { FormProviderProps } from '../FormProvider';
import {
    ActionUnknown,
    ActionWithKey,
    ActionWithKeyAndIndex,
    ActionWithKeyAndValue,
    ActionWithValue,
    ArrayFieldState,
    Config,
    FieldState,
    ParentFieldState,
    SimpleFieldState,
} from '../typings';
import { throwError } from './utils';

export const checkConfigs = (configs: Config[]) => {
    const checkedConfigs = configs.map(checkConfig);
    const duplicate = checkedConfigs.reduce((acc, curr) => {
        return acc
            ? acc
            : checkedConfigs.filter(c => c.name === curr.name).length > 1
            ? curr.name
            : '';
    }, '');
    if (duplicate) {
        throwError(
            `The 'name' property must be unique for each form. A config`,
            `object with name '${duplicate}' was given more than once.`,
        );
    }
};

const checkConfig = <S extends object>(config: Config<S>) => {
    const { fields, name } = config;
    const fieldsType = typeof fields;
    if (!name) {
        throwError(`The 'name' property in the config object is required!`);
    }
    switch (fieldsType) {
        case 'object':
            break;
        case 'undefined':
            throwError(`'The 'fields' property in the config object for '${name}' is required!`);
        default:
            throwError(`The 'fields' property in the config object for '${name}' must be an object. Type '${fieldsType}' was given`);
    }
    if (!Object.entries(fieldsType).length) {
        throwError('At least one field is required in \'fields\' property in of the config object!');
    }
    return config;
};

export const checkActionForKey = (action: ActionUnknown) => {
    if (!action.key) {
        throwError(`Action of type ${action.type} is missing a value for 'key!'`);
    }
    if (typeof action.key !== 'string') {
        throwError(`Key value for actions of type ${action.type} must be of type 'string'`);
    }
    return action as ActionWithKey;
};

export const checkActionForInputValue = (action: ActionUnknown) => {
    const valueType = typeof action.value;
    if (valueType === 'undefined') {
        throwError(`Action of type ${action.type} is missing 'value'`);
    }
    if (!['string', 'number', 'boolean'].includes(valueType) && !Array.isArray(action.value)) {
        throwError(`'Value' for action ${action.type} must be a string, number, boolean, string[] or number[], type ${valueType} given.`);
    }
    return action as ActionWithKeyAndValue;
};

export const checkActionForObjectValue = (action: ActionUnknown) => {
    const { type, value } = action;
    const valueType = typeof value;
    if (valueType === 'undefined') {
        throwError(`Action of type ${type} is missing 'value'`);
    }
    if (typeof value !== 'object' || value === {} || Array.isArray(value)) {
        throwError(`'value' for action ${type} must be a non-empty object type.`);
    }
    return action as ActionWithValue<object>;
};

export const checkActionForKeyAndIndex = (action: ActionUnknown) => {
    checkActionForKey(action);
    const valueType = typeof action.index;
    if (valueType === 'undefined') {
        throwError(`Action of type ${action.type} is missing 'index'`);
    }
    if (valueType !== 'number') {
        throwError(`'index' for action ${action.type} must be a number, type ${valueType} given.`);
    }
    return action as ActionWithKeyAndIndex;
};

export const checkForRenderProp = <S extends object, P extends FormProviderProps<S>>(props: P): P => {
    if (typeof props.render === 'undefined') {
        throwError(`Prop 'render' is required in FormProvider/LocalForm.`);
    }
    if (typeof props.render !== 'function') {
        throwError(`FormProvider/LocalForm's 'render' prop must be a function.`);
    }
    return props;
};

export const checkFieldType = (field: FieldState): FieldState => {
    const { fields } = field as ParentFieldState;
    if (typeof fields === 'undefined') {
        return field as SimpleFieldState;
    }
    if (Array.isArray(fields)) {
        return field as ArrayFieldState;
    }
    if (typeof fields === 'object') {
        return field as ParentFieldState;
    }
    return throwError('Fields is invalid');
};

export const checkPath = (path: string[], target: object | any[], strFormat?: string) => {
    if (typeof _get(target, path) === 'undefined') {
        throwError(
            `The given key '${strFormat || path.join('.')}' does not correspond`,
            `to a defined part of the state tree. Please check that the key is valid`,
        );
    }
    return path;
};
