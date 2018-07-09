import creatorFactory from '../actions/creatorFactory';
import types from '../actions/types';
import { checkActionForObjectValue } from '../helpers/checkers';
import { extract } from '../helpers/utils';
import {
    createClearFieldReducer,
    createResetFieldReducer,
    createShowFieldErrorsReducer,
    createUpdateFieldReducer,
    } from '../reducers/fieldReducer';
import {
    ActionUnknown,
    ActionWithKeyAndValue,
    CompleteConfig,
    FormState,
    InputValue,
    ShowErrorsAction,
    ValidateAction,
    } from '../typings';
import { createValidateFieldReducer } from './fieldReducer';

export const createFormReducer = <S extends object>(config: CompleteConfig<S>) =>
    (state: FormState, action: ActionUnknown) => {
        switch (action.type) {
            case types.FORM_UPDATE:
                return formUpdateReducer(config)(state, action);
            case types.FORM_CLEAR:
                return formClearReducer(config)(state);
            case types.FORM_RESET:
                return formResetReducer(config)(state);
            case types.FORM_SHOW_ERRORS:
                return formShowErrorsReducer(config)(state, action);
            case types.FORM_VALIDATE:
                return formValidateReducer(config)(state, action as ValidateAction<false>);
            default:
                return state;
        }
    };

export const formUpdateReducer = (config: CompleteConfig) => (state: FormState, action: ActionUnknown) => {
    const { value } = checkActionForObjectValue(action);
    const updateActions = createUpdateActions(config)(value);
    return updateActions.reduce((updatedState: FormState, fieldAction) =>
        createUpdateFieldReducer(config)(updatedState, fieldAction), state);
};

const createUpdateActions = <S extends object>(config: CompleteConfig<S>) =>
    (obj: object, parentKey?: string): ActionWithKeyAndValue<InputValue>[] => {
        return Object.entries(obj).reduce((acc: ActionWithKeyAndValue<InputValue>[], [fieldKey, value]) => {
            const key = parentKey ? `${parentKey}.${fieldKey}` : fieldKey;
            if (typeof value === 'object') {
                return [...acc, ...createUpdateActions(config)(value, key)];
            }
            const action = creatorFactory(config).updateField(key, value);
            return [...acc, action];
        }, []);
    };

const formClearReducer = (config: CompleteConfig) =>  (state: FormState) => {
    const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
    const clearActions = keys.map(creatorFactory(config).clearField);
    return clearActions.reduce((updatedState: FormState, fieldAction) =>
        createClearFieldReducer()(updatedState, fieldAction), state);
};

const formResetReducer = (config: CompleteConfig) =>
    (state: FormState) => {
        const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
        const resetActions = keys.map(creatorFactory(config).resetField);
        return resetActions.reduce((updatedState: FormState, fieldAction) =>
            createResetFieldReducer()(updatedState, fieldAction), state);
    };

export const formShowErrorsReducer = (config: CompleteConfig) =>
    (state: FormState, action: ActionUnknown) => {
        const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
        const { showErrors } = action as ShowErrorsAction<false>;
        const creator = (key: string) => creatorFactory(config).showFieldErrors(key, showErrors);
        const showErrorActions = keys.map(creator);
        return showErrorActions.reduce((updatedState: FormState, fieldAction) =>
            createShowFieldErrorsReducer()(updatedState, fieldAction), state);
    };

export const formValidateReducer = (config: CompleteConfig) =>
    (state: FormState, action: ValidateAction<false>) => {
        const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
        const validateActions = keys.map(key => creatorFactory(config).validateField(key, action.validator));
        return validateActions.reduce((updatedState: FormState, fieldAction) =>
            createValidateFieldReducer()(updatedState, fieldAction), state);
    };
