import { SyntheticEvent } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import ThunkFactory from './actions/ThunkFactory';
import { extract, flatten, pick, selectField, throwError } from './helpers/utils';
import {
    ArrayFieldProps,
    CompleteConfig,
    FieldBindProps,
    FieldType,
    FormBindProps,
    FormProps,
    FormState,
    InputProps,
    InputValue,
    MappedOption,
    ParentFieldProps,
    SimpleFieldProps,
    SimpleFieldState,
} from './typings';

// creates a connect HOC for the form specified by its config argument
export const formConnect = <S extends object>(config: CompleteConfig<S>) => {
    const mapState = createStateMapper(config);
    const mapDispatch = createDispatchMapper(config);
    const mergeProps = (stateProps: FormState<S>, dispatchProps: object, ownProps: object) => ({
        ...ownProps,
        [config.name]: mergeFormProps(config)(stateProps, dispatchProps),
    });
    return connect<any, any>(mapState, mapDispatch, mergeProps);
};

// mocks the behavior of a connect HOC for use with the LocalForm component
export const localFormConnect = (config: CompleteConfig) => (state, dispatch) => {
    const mappedState = createStateMapper(config)(state);
    const mappedDispatch = createDispatchMapper(config)(dispatch);
    return mergeFormProps(config)(mappedState, mappedDispatch);
};

// selects the form from the Redux state tree
const createStateMapper = (config: CompleteConfig) => {
    const { name, mapState } = config;
    return (state: object) => {
        const formState = mapState(state);
        if (typeof formState === 'undefined') {
            // of the state selected by mapState is undefined throw an error;
            throwError(
                `'mapStateToProps' for form ${name} returned undefined. Make sure`,
                `you add a selector function to the config object if you used`,
                `'combineReducers' to add forms to your redux.`,
            );
        }
        return formState;
    };
};

// creates functions to dispatch form actions to the store
const createDispatchMapper = <S extends object>(config: CompleteConfig<S>) => {
    const thunks = new ThunkFactory(config);
    return (dispatch: Dispatch<any>) => ({
        updateForm: (value: any) => dispatch(thunks.updateForm(value)),
        clearForm: () => dispatch(thunks.clearForm()),
        resetForm: () => dispatch(thunks.resetForm()),
        showFormErrors: (showErrors?: boolean) =>
            dispatch(thunks.showFormErrors(showErrors)),
        updateField: (key: string, value: any) =>
            dispatch(thunks.updateField(key, value)),
        focusField: (key: string) => dispatch(thunks.focusField(key)),
        blurField: (key: string) => dispatch(thunks.blurField(key)),
        clearField: (key: string) => dispatch(thunks.clearField(key)),
        resetField: (key: string) => dispatch(thunks.resetField(key)),
        validateField: (key: string) => dispatch(thunks.validateField(key)),
        showFieldErrors: (key: string, showErrors?: boolean) =>
            dispatch(thunks.showFieldErrors(key, showErrors)),
        addArrayField: (key: string) => dispatch(thunks.addArrayField(key)),
        deleteArrayField: (key: string, index: number) =>
            dispatch(thunks.deleteArrayField(key, index)),
    });
};

// merges the state and dispatchers above into a single Form prop
// see https://axelyung.github.io/yarfl/api/Form.html
const mergeFormProps = <S extends object>(config: CompleteConfig<S>) =>
    (state: FormState<S>, dispatchers: object): FormProps<S> => {
        const methods = createFormMethods(config)(state, dispatchers);
        const props = createFormProps(state);
        return {
            name: config.name,
            ...methods,
            ...props,
        };
    };

// selects form properties from the state
const createFormProps = <S extends object>(state: FormState<S>) => {
    const fieldErrors = extract(state.fields, 'errors', {
        ignoreEmptyStrings: true,
        flatten: true,
    });
    const errors = Object.values(fieldErrors)
        .filter(err => !Array.isArray(err));
    const errorCount = errors.length;
    return {
        extra: state.extra,
        errors,
        errorCount,
        valid: !errorCount,
        values: extract(state.fields, 'value') as S,
    };
};

// creates methods to dispatch form actions
const createFormMethods = <S extends object>(config: CompleteConfig<S>) =>
    (state: FormState<S>, dispatchers: any) => ({
        // TODO: allow set to update other properties
        select: createSelect(config)(state, dispatchers),
        set: (value: Partial<S>) => dispatchers.updateForm(value),
        clear: () => dispatchers.clearForm(),
        reset: () => dispatchers.resetForm(),
        showErrors: (showErrors?: boolean) =>
            dispatchers.showFormErrors(showErrors),
        // tslint:disable-next-line:no-shadowed-variable
        extract: (key: keyof SimpleFieldState, flatten: boolean = false) =>
            extract(state.fields, key, { flatten }),
        bind: createFormBinder(config),
    });

// creates bind function to select properties from config to spread on form element
const createFormBinder = <S extends object>(config: CompleteConfig<S>) =>
    (): FormBindProps<S> => pick(config, [
        'action',
        'name',
        'method',
        'onSubmit',
        'onChange',
        'onInput',
        'onInvalid',
    ]) as FormBindProps<S>;

// creates a select function to target a specific field in the state
const createSelect = <S extends object>(config: CompleteConfig) =>
    (state: FormState<S>, dispatchers: any, prefix?: string) =>
        (keyStr: string, fromRoot = false) => {
            const key = fromRoot
                ? keyStr
                : prefix && /^\[\d+\]\..+$/.test(keyStr)
                ? `${prefix}${keyStr}`
                : prefix
                ? `${prefix}.${keyStr}`
                : keyStr;
            const props = selectField(state, key) as any;
            if (!props) {
                throwError(
                    `Key '${key}' does not correspond to an existing node in the state.`,
                    `Check spelling and/or that the parent key is included.`,
                );
            }
            const methods = createFieldMethods(config)(key, state, dispatchers);
            const { showErrors, extra, fields, fieldType } = props;
            const errors = fieldType === FieldType.Simple
                ? props.errors
                : flatten(Object.values(extract(fields, 'errors', { flatten: true })));
            const errorCount = errors.length;
            const valid = !errorCount;
            const common = {
                ...props,
                ...methods,
                errors,
                errorCount,
                valid,
                extra,
            };
            // if the field is of array type
            if (props.fieldType === FieldType.Array) {
                common.length = fields.length;
                return common as ArrayFieldProps;
            }
            // if the field contains other fields
            if (props.fieldType === FieldType.Parent) {
                return common as ParentFieldProps;
            }
            // if a "regular" field
            const errorMessage = showErrors && !valid ? errors[0] : '';
            // TODO: don't set options if missing
            const options = mapOptions(props, methods);
            return { ...common, errorMessage, options } as SimpleFieldProps;
        };

const createFieldMethods = (config: CompleteConfig) =>
    (key: string, state: FormState, dispatchers: any) => {
        const props = selectField(state, key);
        const common = {
            set: (value: any) => dispatchers.updateField(key, value),
            clear: () => dispatchers.clearField(key),
            reset: () => dispatchers.resetField(key),
            showErrors: (showErrors?: boolean) =>
            dispatchers.showFieldErrors(key, showErrors),
        };
        switch (props.fieldType) {
            case FieldType.Array:
                return {
                    ...common,
                    add: () => dispatchers.addArrayField(key),
                    del: (index: number) => dispatchers.deleteArrayField(key, index),
                    select: createSelect(config)(state, dispatchers, key),
                };
            case FieldType.Parent:
                return {
                    ...common,
                    select: createSelect(config)(state, dispatchers, key),
                };
            case FieldType.Simple:
            default:
                return {
                    ...common,
                    bind: createFieldBinder(config)(key, props, dispatchers),
                };
        }
    };

const createFieldBinder = (config: CompleteConfig) =>
    (key: string, props: any, dispatchers: any) =>
        (): FieldBindProps => {
            // tslint:disable-next-line:no-unnecessary-initializer
            const field = selectField(config, key, true) || {};
            const inputProps = pick(props, [
                'type',
                'default',
                'id',
                'label',
                'placeholder',
                'name',
                'disabled',
                'autoFocus',
                'multiple',
                'autoComplete',
            ]) as InputProps;
            const fetchedValue = field.getter
                ? field.getter(props.value)
                : props.value;
            const bindProps = {
                ...inputProps,
                value: fetchedValue,
                onChange: createOnChangeHandler(key, props, dispatchers, field.setter),
                onBlur: () => dispatchers.blurField(key),
                onFocus: () => dispatchers.focusField(key),
            };
            return props.type === 'checkbox'
                ? { ...bindProps, checked: !!fetchedValue }
                : bindProps;
        };

const createOnChangeHandler = (key, props, dispatchers, setter = v => v) =>
    (e: SyntheticEvent<HTMLInputElement>, value?: InputValue) => {
        const { type, multiple } = props;
        if (value !== undefined && value !== null) {
            return dispatchers.updateField(key, setter(value));
        }
        if (type === 'select' && multiple) {
            const update = Array.from((e.target as any).options)
                .filter((opt: any) => opt.selected)
                .map((opt: any) => opt.value);
            return dispatchers.updateField(key, setter(update));
        }
        const { currentTarget, target } = e;
        const { checked, value: targetValue } = (currentTarget || target) as any;
        const checkedValue = setter(type === 'checkbox' ? checked : targetValue);
        return dispatchers.updateField(key, checkedValue);
    };

const mapOptions = (props: any, methods: any): undefined | MappedOption[] => {
    const { options, value, type } = props;
    // TODO: should throw error if trying to map options for field without options
    if (!options || !Array.isArray(options) || !options.length) return [];

    const { onChange } = methods.bind();

    return options.map((opt: any) => {
        const bindProps = {
            ...opt,
            onChange,
            checked: type !== 'select' ? opt.value === value : undefined,
        };
        return {
            ...opt,
            bind: () => bindProps,
        };
    });
};
