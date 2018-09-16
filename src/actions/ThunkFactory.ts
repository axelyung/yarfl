import { Dispatch } from 'redux';
import { selectField } from '../helpers/utils';
import { asyncValidatorFactory, validatorFactory } from '../helpers/validator';
import { Action, ActionUnknown, CompleteConfig, FormState, InputValue } from '../typings';
import creatorFactory, { ActionCreators } from './creatorFactory';
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
        case types.FIELD_VALIDATE_END:
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

    private validateFormInternal = () => (dispatch, getState) => {
        const formState = this.selector(getState);
        if (formState.isAsync) {
            return this.createValidatorAsync(formState)
                .then(validator => dispatch(this.creators.validateForm(validator)));
        }
        return dispatch(this.creators.validateForm(this.createValidator(formState)));
    }

    public validateField = (key: string) =>
        async (dispatch, getState) => {
            const formState = this.selector(getState);
            if (formState.isAsync) {
                dispatch(this.creators.validateFieldStart(key));
            }
            const validator = formState.isAsync
                ? await this.createValidatorAsync(formState)
                : this.createValidator(formState);
            const action = this.creators.validateFieldEnd(key, validator);
            return dispatch(action);
        }

    private postAction = (action: ActionUnknown) =>
        (dispatch: Dispatch): void | Promise<void> => {
            const { key } = action;
            if (this.shouldShowErrors(action)) {
                if (key) {
                    dispatch(this.creators.showFieldErrors(key, true));
                } else {
                    dispatch(this.creators.showFormErrors(true));
                }
            }
            if (this.shouldValidate(action)) {
                if (key) {
                    return dispatch(this.validateField(key) as any);
                }
                return dispatch(this.validateFormInternal() as any);
            }
        }

    public updateForm = (value: object) => (dispatch) => {
        const action = this.creators.updateForm(value);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public clearForm = () => (dispatch) => {
        const action = this.creators.clearForm();
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public resetForm = () => (dispatch) => {
        const action = this.creators.resetForm();
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public validateForm = () => (dispatch, getState) => {
        const formState = this.selector(getState);
        if (formState.isAsync) {
            return this.createValidatorAsync(formState)
                    .then(validator => dispatch(this.creators.validateForm(validator)));
        }
        return dispatch(this.creators.validateForm(this.createValidator(formState)));
    }
    public showFormErrors = (showErrors: boolean = true) => (dispatch, getState) => {
        const action = this.creators.showFormErrors(showErrors);
        dispatch(action);
        const validator = this.createValidator(this.selector(getState));
        return dispatch(this.creators.validateForm(validator));
    }
    public updateNode = (key: string, value: object) => (dispatch) => {
        const action = this.creators.updateNode(key, value);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public clearNode = (key: string) => (dispatch) => {
        const action = this.creators.clearNode(key);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public resetNode = (key: string) => (dispatch) => {
        const action = this.creators.resetNode(key);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public validateNode = (key: string) => (dispatch, getState) => {
        const formState = this.selector(getState);
        if (formState.isAsync) {
            return this.createValidatorAsync(formState).then(validator => {
                return dispatch(this.creators.validateNode(key, validator));
            });
        }
        return dispatch(this.creators.validateNode(key, this.createValidator(formState)));
    }
    public showNodeErrors = (key: string, showErrors: boolean = true) => (dispatch) => {
        const action = this.creators.showNodeErrors(key, showErrors);
        dispatch(action);
    }
    public updateField = (key: string, value: InputValue) => (dispatch) => {
        const action = this.creators.updateField(key, value);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public focusField = (key: string) => (dispatch) => {
        const action = this.creators.focusField(key);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public blurField = (key: string) => (dispatch) => {
        const action = this.creators.blurField(key);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public clearField = (key: string) => (dispatch) => {
        const action = this.creators.clearField(key);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public resetField = (key: string) => (dispatch) => {
        const action = this.creators.resetField(key);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
    public showFieldErrors = (key: string, showErrors: boolean = true) => (dispatch) => {
        dispatch(this.creators.showFieldErrors(key, showErrors));
        if (showErrors) {
            return dispatch(this.validateField(key));
        }
    }
    public addArrayField = (key: string) => async (dispatch, getState) => {
        const action = this.creators.addArrayField(key);
        await dispatch(action);
        const arrayField = selectField(this.selector(getState), key);
        const index = arrayField.fields.length - 1;
        const keys = Object.keys(arrayField.fields[index]).map(fieldKey => `${key}[${index}].${fieldKey}`);
        return Promise.all(keys.map(k => dispatch(this.postAction(this.creators.addArrayField(k)))));
    }
    public deleteArrayField = (key: string, index: number) => (dispatch) => {
        const action = this.creators.deleteArrayField(key, index);
        dispatch(action);
        return dispatch(this.postAction(action));
    }
}
