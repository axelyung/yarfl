import types from '../actions/types';
import {
    checkActionForInputValue,
    checkActionForKey,
    } from '../helpers/checkers';
import {
    mergeIn,
    mergeUp,
    parseKey,
    selectField,
    setInWithKey,
    setInWithPath,
    throwError,
    } from '../helpers/utils';
import {
    ActionUnknown,
    ActionWithKey,
    ActionWithKeyAndValue,
    CompleteConfig,
    FormState,
    InputValue,
    ShowErrorsAction,
    ValidateAction,
    } from '../typings';

export const createFieldReducer = <S extends object>(config: CompleteConfig<S>) =>
    (state: FormState, action: ActionUnknown) => {
        const { type } = action;
        switch (type) {
            case types.FIELD_UPDATE:
            case types.FIELD_FOCUSED:
            case types.FIELD_BLURRED:
            case types.FIELD_CLEAR:
            case types.FIELD_RESET:
            case types.FIELD_VALIDATE:
            case types.FIELD_SHOW_ERRORS:
                break;
            default:
                return state;
        }
        const actionWithKey = checkActionForKey(action);
        switch (type) {
            case types.FIELD_UPDATE:
                const actionWithInputValue = checkActionForInputValue(action);
                return createUpdateFieldReducer(config)(state, actionWithInputValue);
            case types.FIELD_FOCUSED:
                return createFocusFieldReducer()(state, actionWithKey);
            case types.FIELD_BLURRED:
                return createBlurFieldReducer()(state, actionWithKey);
            case types.FIELD_CLEAR:
                return createClearFieldReducer()(state, actionWithKey);
            case types.FIELD_RESET:
                return createResetFieldReducer()(state, actionWithKey);
            case types.FIELD_VALIDATE:
                // TODO
                return createValidateFieldReducer()(state, actionWithKey as ValidateAction<true>);
            case types.FIELD_SHOW_ERRORS:
                // TODO
                return createShowFieldErrorsReducer()(state, actionWithKey as ShowErrorsAction<true>);
            default:
                return state;
        }
    };

const parseValue = (config: CompleteConfig) => (state: FormState) => (key: string, value: InputValue) => {
    const typeOfValue = typeof value;
    if (typeOfValue === 'number') {
        return value;
    }
    // TODO: make fields part of the state
    const hasTypeNumber = (selectField(state, key) as any).type === 'number';
    if (!hasTypeNumber) {
        return value;
    }
    const { autoParseNumbers } = config;
    if (!autoParseNumbers) {
        return value;
    }
    if (typeOfValue === 'string') {
        const parsed = parseFloat(value as string);
        return isNaN(parsed) ? '' : parsed;
    }
    if (typeOfValue === 'boolean') {
        return value ? 1 : 0;
    }
    return throwError(`Could not parse value for ${key} to number. A value of type ${typeOfValue} was given.`);
};

export const createUpdateFieldReducer = <S extends object>(config: CompleteConfig<S>) =>
    (state: FormState, action: ActionWithKeyAndValue<InputValue>) => {
        const { key, value } = action;
        const fieldPath = parseKey(key);
        const parsedValue = parseValue(config)(state)(key, value);
        const updatedValue = setInWithKey(state, key, 'value', parsedValue);
        return fieldPath.length > 1
            ? mergeUp(updatedValue, key, {
                changed: true,
                touched: true,
            })
            : mergeIn(updatedValue, key, {
                changed: true,
                touched: true,
            });
    };

const createFocusFieldReducer = () =>
    (state: FormState, action: ActionUnknown) => {
        const { key } = checkActionForKey(action);
        return key.includes('.') ?
            mergeUp(state, key, { focused: true }) :
            setInWithPath(state, ['fields', key, 'focused'], true);
    };

const createBlurFieldReducer = () =>
    (state: FormState, action: ActionWithKey) => {
        const { key } = action;
        return key.includes('.')
            ? mergeUp(state, key, {
                focused: false,
                touched: true,
            })
            : mergeIn(state, key, {
                focused: false,
                touched: true,
            });
    };

export const createClearFieldReducer = () =>
    (state: FormState, action: ActionWithKey) => {
        const { key } = action;
        const { multiple, initial, changed } = selectField(state, key) as any;
        const value: any = multiple ? [] : '';
        return mergeIn(state, key, {
            value,
            changed: changed || value !== initial,
        });
    };

export const createResetFieldReducer = () =>
    (state: FormState, action: ActionWithKey) => {
        const { key } = action;
        const dfault = (selectField(state, key) as any).default;
        const valueUpdated = setInWithKey(state, key, 'value', dfault);
        return key.includes('.')
            ? mergeUp(valueUpdated, key, {
                changed: false,
                touched: false,
                showErrors: false,
            })
            : mergeIn(valueUpdated, key, {
                changed: false,
                touched: false,
                showErrors: false,
            });
    };

export const createValidateFieldReducer = () => (state: FormState, action: ValidateAction<true>) => {
    const { key, validator } = action;
    const fieldErrors = validator.errors.get(key);
    return setInWithKey(state, key, 'errors', fieldErrors);
};

export const createShowFieldErrorsReducer = () => (state: FormState, action: ShowErrorsAction<true>) => {
    const { key, showErrors } = action;
    return setInWithKey(state, key, 'showErrors', showErrors);
};
