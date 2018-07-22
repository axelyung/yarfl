import creatorFactory from '../actions/creatorFactory';
import types from '../actions/types';
import { checkActionForKey, checkActionForObjectValue } from '../helpers/checkers';
import { extract, setInWithPath } from '../helpers/utils';
import {
    ActionUnknown,
    ActionWithKey,
    CompleteConfig,
    FormState,
    ShowErrorsAction,
    } from '../typings';
import {
    createClearFieldReducer,
    createResetFieldReducer,
    createShowFieldErrorsReducer,
    createValidateFieldReducer,
    } from './fieldReducer';
import { formUpdateReducer } from './formReducer';

export const createNodeReducer = <S extends object>(config: CompleteConfig<S>) =>
    (state: FormState, action: ActionUnknown) => {
        switch (action.type) {
            case types.NODE_UPDATE:
                return nodeUpdateReducer(config)(state, action);
            case types.NODE_CLEAR:
                return nodeClearReducer(config)(state, action);
            case types.NODE_RESET:
                return nodeResetReducer(config)(state, action);
            case types.NODE_SHOW_ERRORS:
                return nodeShowErrorsReducer(config)(state, action);
            case types.NODE_VALIDATE:
                return nodeValidateReducer(config)(state, action);
            default:
                return state;
        }
    };

const nodeUpdateReducer = (config: CompleteConfig) => (state: FormState, action: ActionUnknown) => {
    const { key } = checkActionForKey(action);
    const { value } = checkActionForObjectValue(action);
    const updateObject = setInWithPath({}, key.split('.'), value);
    const updateAction = creatorFactory(config).updateForm(updateObject);
    return formUpdateReducer(config)(state, updateAction);
};

const nodeClearReducer = (config: CompleteConfig) =>  (state: FormState, action: ActionUnknown) => {
    const { key } = checkActionForKey(action);
    const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
    const nodeKeys = keys.filter(k => k.startsWith(key));
    const clearActions = nodeKeys.map(creatorFactory(config).clearField);
    return clearActions.reduce((updatedState: FormState, fieldAction) =>
        createClearFieldReducer()(updatedState, fieldAction), state);
};

const nodeResetReducer = (config: CompleteConfig) => (state: FormState, action: ActionUnknown) => {
    const { key } = checkActionForKey(action);
    const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
    const nodeKeys = keys.filter(k => k.startsWith(key));
    const resetActions = nodeKeys.map(creatorFactory(config).resetField);
    return resetActions.reduce((updatedState: FormState, fieldAction) =>
        createResetFieldReducer()(updatedState, fieldAction), state);
};

const nodeShowErrorsReducer = (config: CompleteConfig) => (state: FormState, action: ActionUnknown) => {
    const { key, showErrors } = checkActionForKey(action) as ShowErrorsAction<true> & ActionWithKey;
    const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
    const nodeKeys = keys.filter(k => k.startsWith(key));
    const showErrorActions = nodeKeys.map(k => creatorFactory(config).showFieldErrors(k, showErrors));
    return showErrorActions.reduce((updatedState: FormState, fieldAction) =>
        createShowFieldErrorsReducer()(updatedState, fieldAction), state);
};

const nodeValidateReducer = (config: CompleteConfig) => (state: FormState, action: any) => {
    const { key, validator } = action;
    const keys = Object.keys(extract(state.fields, 'key', { flatten: true }));
    const nodeKeys = keys.filter(k => k.startsWith(key));
    const resetActions = nodeKeys.map(k => creatorFactory(config).validateField(k, validator));
    return resetActions.reduce((updatedState: FormState, fieldAction) =>
        createValidateFieldReducer()(updatedState, fieldAction), state);
};
