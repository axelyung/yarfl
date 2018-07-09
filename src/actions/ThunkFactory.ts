import { Dispatch } from 'redux';
import { asyncValidatorFactory, validatorFactory } from '../helpers/validator';
import { Action, ActionCreators, ActionUnknown, CompleteConfig, FormState, InputValue, StateWithForms } from '../typings';
import creatorFactory from './creatorFactory';
import types from './types';

const shouldValidateFactory = (config: CompleteConfig) => (action: Action): boolean => {
    const {
            validateOnFocus,
            validateOnBlur,
            validateOnChange,
            validateOnClear,
            validateOnReset,
            validateOnAdd,
            validateOnDelete,
        } = config;
    switch (action.type) {
        case types.FIELD_FOCUSED:
            return validateOnFocus;
        case types.FIELD_BLURRED:
            return validateOnBlur;
        case types.FORM_UPDATE:
        case types.FIELD_UPDATE:
            return validateOnChange;
        case types.FORM_CLEAR:
        case types.FIELD_CLEAR:
            return validateOnClear;
        case types.FORM_RESET:
        case types.FIELD_RESET:
            return validateOnReset;
        case types.ARRAY_FIELD_ADD:
            return validateOnAdd;
        case types.ARRAY_FIELD_DELETE:
            return validateOnDelete;
        case types.FORM_SHOW_ERRORS:
        case types.FIELD_SHOW_ERRORS:
        case types.FORM_VALIDATE:
        case types.FIELD_VALIDATE:
            return true;
        default:
            return false;
    }
};

const shouldShowErrorsFactory = (config: CompleteConfig) => (action: Action): boolean => {
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
        case types.FORM_UPDATE:
        case types.FIELD_UPDATE:
            return showErrorsOnChange;
        case types.FORM_CLEAR:
        case types.FIELD_CLEAR:
            return showErrorsOnClear;
        case types.FORM_RESET:
        case types.FIELD_RESET:
            return showErrorsOnReset;
        case types.FORM_SHOW_ERRORS:
        case types.FIELD_SHOW_ERRORS:
            return true;
        default:
            return false;
    }
};

export default class ThunkFactory {
    private readonly creators: ActionCreators;
    private readonly createValidator;
    private readonly createValidatorAsync;
    private readonly selector: (getState) => FormState;
    private readonly shouldShowErrors: (action: Action) => boolean;
    private readonly shouldValidate: (action: Action) => boolean;

    constructor(config: CompleteConfig) {
        this.creators = creatorFactory(config);
        this.createValidator = validatorFactory(config);
        this.createValidatorAsync = asyncValidatorFactory(config);
        this.selector = config.mapState
            ? getState => config.mapState(getState())
            : getState => getState()[config.name];
        this.shouldValidate = shouldValidateFactory(config);
        this.shouldShowErrors = shouldShowErrorsFactory(config);
    }

    private validateForm = () => (dispatch, getState) => {
        const formState = this.selector(getState);
        if (formState.isAsync) {
            return this.createValidatorAsync(formState)
                .then(validator => dispatch(this.creators.validateForm(validator)));
        }
        return dispatch(this.creators.validateForm(this.createValidator(formState)));
    }

    private validateField = (key: string) =>
        (dispatch, getState) => {
            const formState = this.selector(getState);
            if (formState.isAsync) {
                return this.createValidatorAsync(formState)
                    .then(validator => dispatch(this.creators.validateField(key, validator)));
            }
            return dispatch(this.creators.validateField(key, this.createValidator(formState)));
        }

    private postAction = (action: ActionUnknown) =>
        (dispatch: Dispatch, getState: () => StateWithForms): void | Promise<void> => {
            const { key } = action;
            const formState = this.selector(getState);
            if (formState.isAsync && this.shouldValidate(action)) {
                return this.createValidatorAsync(formState).then(validator => {
                    if (key) {
                        dispatch(this.creators.validateField(key, validator));
                        if (this.shouldShowErrors(action)) {
                            dispatch(this.creators.showFieldErrors(key, true));
                        }
                    } else {
                        dispatch(this.creators.validateForm(validator));
                        if (this.shouldShowErrors(action)) {
                            dispatch(this.creators.showFormErrors(true));
                        }
                    }
                });
            }
            if (key) {
                if (this.shouldValidate(action)) {
                    dispatch(this.validateField(key) as any);
                }
                if (this.shouldShowErrors(action)) {
                    dispatch(this.creators.showFieldErrors(key, true));
                }
            } else {
                if (this.shouldValidate(action)) {
                    dispatch(this.validateForm() as any);
                }
                if (this.shouldShowErrors(action)) {
                    dispatch(this.creators.showFormErrors(true));
                }
            }
        }

    public getThunks = () => ({
        updateForm: (value: object) => (dispatch) => {
            const action = this.creators.updateForm(value);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        clearForm: () => (dispatch) => {
            const action = this.creators.clearForm();
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        resetForm: () => (dispatch) => {
            const action = this.creators.resetForm();
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        validateForm: () => (dispatch, getState) => {
            const formState = this.selector(getState);
            if (formState.isAsync) {
                return this.createValidatorAsync(formState)
                    .then(validator => dispatch(this.creators.validateForm(validator)));
            }
            return dispatch(this.creators.validateForm(this.createValidator(formState)));
        },
        showFormErrors: (showErrors: boolean = true) => (dispatch, getState) => {
            const action = this.creators.showFormErrors(showErrors);
            dispatch(action);
            const validator = this.createValidator(this.selector(getState));
            return dispatch(this.creators.validateForm(validator));
        },
        updateNode: (key: string, value: object) => (dispatch) => {
            const action = this.creators.updateNode(key, value);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        clearNode: (key: string) => (dispatch) => {
            const action = this.creators.clearNode(key);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        resetNode: (key: string) => (dispatch) => {
            const action = this.creators.resetNode(key);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        validateNode: (key: string) => (dispatch, getState) => {
            const formState = this.selector(getState);
            if (formState.isAsync) {
                return this.createValidatorAsync(formState).then(validator => {
                    return dispatch(this.creators.validateNode(key, validator));
                });
            }
            return dispatch(this.creators.validateNode(key, this.createValidator(formState)));
        },
        showNodeErrors: (key: string, showErrors: boolean = true) => (dispatch) => {
            const action = this.creators.showNodeErrors(key, showErrors);
            dispatch(action);
        },
        updateField: (key: string, value: InputValue) => (dispatch) => {
            const action = this.creators.updateField(key, value);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        focusField: (key: string) => (dispatch) => {
            const action = this.creators.focusField(key);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        blurField: (key: string) => (dispatch) => {
            const action = this.creators.blurField(key);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        clearField: (key: string) => (dispatch) => {
            const action = this.creators.clearField(key);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        resetField: (key: string) => (dispatch) => {
            const action = this.creators.resetField(key);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        validateField: this.validateField,
        showFieldErrors: (key: string, showErrors: boolean = true) => (dispatch) => {
            const action = this.creators.showFieldErrors(key, showErrors);
            dispatch(action);
            if (showErrors) {
                return dispatch(this.validateField(key));
            }
        },
        addArrayField: (key: string) => (dispatch) => {
            const action = this.creators.addArrayField(key);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
        deleteArrayField: (key: string, index: number) => (dispatch) => {
            const action = this.creators.deleteArrayField(key, index);
            dispatch(action);
            return dispatch(this.postAction(action));
        },
    })
}