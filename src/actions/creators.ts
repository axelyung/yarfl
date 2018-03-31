import { ActionCreators, CompleteConfig, InputValue } from '../types';
import { types } from './types';

export const creatorFactory = <S extends Object = any>(config: CompleteConfig<S>): ActionCreators => {
    const formName = config.name;
    return {
        updateForm: (value: object) => ({
            type: types.FORM_UPDATE,
            formName,
            value,
        }),
        clearForm: () => ({
            type: types.FORM_CLEAR,
            formName,
        }),
        resetForm: () => ({
            type: types.FORM_RESET,
            formName,
        }),
        validateForm: (validator: Validator.Validator<any>) => ({
            type: types.FORM_VALIDATE,
            formName,
            validator,
            key: undefined,
        }),
        showFormErrors: (showErrors: boolean) => ({
            type: types.FORM_SHOW_ERRORS,
            formName,
            showErrors,
            key: undefined,

        }),
        updateNode: (key: string, value: object) => ({
            type: types.NODE_UPDATE,
            formName,
            key,
            value,
        }),
        clearNode: (key: string) => ({
            type: types.NODE_CLEAR,
            formName,
            key,
        }),
        resetNode: (key: string) => ({
            type: types.NODE_RESET,
            formName,
            key,
        }),
        validateNode: (key: string, validator: Validator.Validator<any>) => ({
            type: types.NODE_VALIDATE,
            formName,
            key,
            validator,
        }),
        showNodeErrors: (key: string, showErrors: boolean) => ({
            type: types.NODE_SHOW_ERRORS,
            formName,
            key,
            showErrors,
        }),
        updateField: (key: string, value: InputValue) => ({
            type: types.FIELD_UPDATE,
            formName,
            key,
            value,
        }),
        focusField: (key: string) => ({
            type: types.FIELD_FOCUSED,
            formName,
            key,
        }),
        blurField: (key: string) => ({
            type: types.FIELD_BLURRED,
            formName,
            key,
        }),
        clearField: (key: string) => ({
            type: types.FIELD_CLEAR,
            formName,
            key,
        }),
        resetField: (key: string) => ({
            type: types.FIELD_RESET,
            formName,
            key,
        }),
        validateField: (key: string, validator: Validator.Validator<any>) => ({
            type: types.FIELD_VALIDATE,
            formName,
            key,
            validator,
        }),
        showFieldErrors: (key: string, showErrors: boolean) => ({
            type: types.FIELD_SHOW_ERRORS,
            formName,
            key,
            showErrors,
        }),
        addArrayField: (key: string) => ({
            type: types.ARRAY_FIELD_ADD,
            formName,
            key,
        }),
        deleteArrayField: (key: string, index: number) => ({
            type: types.ARRAY_FIELD_DELETE,
            formName,
            key,
            index,
        }),
    };
};