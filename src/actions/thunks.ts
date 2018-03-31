import { Dispatch } from 'redux';
import { asyncValidatorFactory, validatorFactory } from '../helpers/validator';
import {
    Action,
    ActionWithKey,
    CompleteConfig,
    FormState,
    InputValue,
    StateWithForms,
    } from '../types';
import { creatorFactory } from './creators';
import { types } from './types';

export const thunkFactory = <S extends Object>(config: CompleteConfig<S>) => {
    const creators = creatorFactory(config);
    const createValidator = validatorFactory(config);
    const createValidatorAsync = asyncValidatorFactory(config);
    const selector = (getState: any): FormState => config.mapState
        ? config.mapState(getState())
        : getState()[config.name];
    const validateField = (key: string) =>
        (dispatch, getState) => {
            const formState = selector(getState);
            if (formState.isAsync) {
                return createValidatorAsync(formState)
                    .then(validator => dispatch(creators.validateField(key, validator)));
            }
            return dispatch(creators.validateField(key, createValidator(formState)));
        };
    const postAction = (action: ActionWithKey) =>
        (dispatch: Dispatch, getState: () => StateWithForms): void | Promise<void> => {
            const { key } = action;
            const formState = selector(getState);

            if (formState.isAsync && shouldValidate(config)(action)) {
                return createValidatorAsync(formState).then(validator => {
                    dispatch(creators.validateField(key, validator));
                    if (shouldShowErrors(config)(action)) {
                        dispatch(creators.showFieldErrors(key, true));
                    }
                });
            }
            if (shouldValidate(config)(action)) {
                dispatch(validateField(key) as any);
            }
            if (shouldShowErrors(config)(action)) {
                dispatch(creators.showFieldErrors(key, true));
            }
            return;
        };

    return {
        updateForm: (value: object) => (dispatch) => {
            const action = creators.updateForm(value);
            dispatch(action);
        },
        clearForm: () => (dispatch) => {
            const action = creators.clearForm();
            dispatch(action);
        },
        resetForm: () => (dispatch) => {
            const action = creators.resetForm();
            dispatch(action);
        },
        validateForm: () => (dispatch, getState) => {
            const formState = selector(getState);
            if (formState.isAsync) {
                return createValidatorAsync(formState)
                    .then(validator => dispatch(creators.validateForm(validator)));
            }
            return dispatch(creators.validateForm(createValidator(formState)));
        },
        showFormErrors: (showErrors: boolean = true) => (dispatch, getState) => {
            const action = creators.showFormErrors(showErrors);
            dispatch(action);
            const validator = createValidator(selector(getState));
            dispatch(creators.validateForm(validator));
        },
        updateNode(key: string, value: object) {
            return (dispatch) => {
                const action = creators.updateNode(key, value);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        clearNode(key: string) {
            return (dispatch) => {
                const action = creators.clearNode(key);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        resetNode(key: string) {
            return (dispatch) => {
                const action = creators.resetNode(key);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        validateNode: (key: string) => (dispatch, getState) => {
            const formState = selector(getState);
            if (formState.isAsync) {
                return createValidatorAsync(formState).then(validator => {
                    return dispatch(creators.validateNode(key, validator));
                });
            }
            return dispatch(creators.validateNode(key, createValidator(formState)));
        },
        showNodeErrors: (key: string, showErrors: boolean = true) => (dispatch) => {
            const action = creators.showNodeErrors(key, showErrors);
            dispatch(action);
        },
        updateField(key: string, value: InputValue) {
            return (dispatch) => {
                const action = creators.updateField(key, value);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        focusField(key: string) {
            return (dispatch) => {
                const action = creators.focusField(key);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        blurField(key: string) {
            return (dispatch) => {
                const action = creators.blurField(key);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        clearField(key: string) {
            return (dispatch) => {
                const action = creators.clearField(key);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        resetField(key: string) {
            return (dispatch) => {
                const action = creators.resetField(key);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        validateField,
        showFieldErrors(key: string, showErrors: boolean = true) {
            return (dispatch) => {
                const action = creators.showFieldErrors(key, showErrors);
                dispatch(action);
                if (showErrors) {
                    return dispatch(validateField(key));
                }
            };
        },
        addArrayField(key: string) {
            return (dispatch) => {
                const action = creators.addArrayField(key);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
        deleteArrayField(key: string, index: number) {
            return (dispatch) => {
                const action = creators.deleteArrayField(key, index);
                dispatch(action);
                return dispatch(postAction(action));
            };
        },
    };
};

const shouldValidate = (config: CompleteConfig) => (action: Action): boolean => {
    const {
            validateOnFocus,
            validateOnBlur,
            validateOnChange,
            validateOnClear,
            validateOnReset,
        } = config;
    switch (action.type) {
        case types.FIELD_FOCUSED:
            return validateOnFocus;
        case types.FIELD_BLURRED:
            return validateOnBlur;
        case types.FIELD_UPDATE:
            return validateOnChange;
        case types.FIELD_CLEAR:
            return validateOnClear;
        case types.FIELD_RESET:
            return validateOnReset;
        case types.FIELD_SHOW_ERRORS:
        case types.FIELD_VALIDATE:
            return true;
        default:
            return false;
    }
};

const shouldShowErrors = (config: CompleteConfig) => (action: Action): boolean => {
    const {
            showErrorsOnFocus,
            showErrorsOnBlur,
            showErrorsOnChange,
            showErrorsOnClear,
            showErrorsOnReset,
        } = config;
    switch (action.type) {
        case types.FIELD_FOCUSED:
            return showErrorsOnFocus;
        case types.FIELD_BLURRED:
            return showErrorsOnBlur;
        case types.FIELD_UPDATE:
            return showErrorsOnChange;
        case types.FIELD_CLEAR:
            return showErrorsOnClear;
        case types.FIELD_RESET:
            return showErrorsOnReset;
        case types.FIELD_SHOW_ERRORS:
            return true;
        default:
            return false;
    }
};