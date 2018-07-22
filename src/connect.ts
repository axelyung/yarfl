import { SyntheticEvent } from 'react';
import { connect, Options } from 'react-redux';
import { Dispatch } from 'redux';
import ThunkFactory from './actions/ThunkFactory';
import {
    extract,
    flatten,
    pick,
    selectField,
    throwError,
} from './helpers/utils';
import {
    ArrayFieldProps,
    CompleteConfig,
    FieldBindProps,
    FieldState,
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

export const createConnector = <S extends object>(
    config: CompleteConfig<S>,
) => (
    mapStateToProps?: any,
    mapDispatchToProps?: any,
    mergeProps?: any,
    options?: any,
) => {
    const extendedMapState = (state: object) => {
        return {
            __YARFL__: config.mapState(state),
            ...(mapStateToProps ? mapStateToProps(state) : {}),
        };
    };
    const extendedMapDispatch = (dispatch: Dispatch<any>) => ({
        __YARFL__: mapDispatch(config)(dispatch),
        ...(mapDispatchToProps ? mapDispatchToProps(dispatch) : {}),
    });
    const extendedMergeProps = (
        stateProps: any,
        dispatchProps: any,
        ownProps: object,
    ) => {
        const formState = stateProps.__YARFL__;
        const formDispatchers = dispatchProps.__YARFL__;
        const userMergedProps = mergeProps
            ? mergeProps(stateProps, dispatchProps, ownProps)
            : ownProps;
        return {
            [config.name]: mergeFormProps(config)(formState, formDispatchers),
            ...userMergedProps,
        };
    };

    return connect(
        extendedMapState,
        extendedMapDispatch,
        extendedMergeProps,
        options,
    );
};

export const connectDirectly = <S extends object>(
    config: CompleteConfig<S>,
    options?: Options,
) => {
    const mapState = createStateMapper(config);
    const mergeProps = (
        stateProps: FormState<S>,
        dispatchProps: object,
        ownProps: object,
    ) => {
        return {
            ...ownProps,
            [config.name]: mergeFormProps(config)(stateProps, dispatchProps),
        };
    };
    return options
        ? connect<any, any>(
              mapState,
              mapDispatch(config),
              mergeProps,
              options,
          )
        : connect<any, any>(
              mapState,
              mapDispatch(config),
              mergeProps,
          );
};

export const localFormMap = (config: CompleteConfig) => (state, dispatch) => {
    const mappedState = createStateMapper(config)(state);
    const mappedDispatch = mapDispatch(config)(dispatch);
    const mergedProps = mergeFormProps(config)(mappedState, mappedDispatch);
    return mergedProps;
};

export const createStateMapper = (config: CompleteConfig) => {
    const { name, mapState } = config;
    return (state: object) => {
        const formState = mapState(state);
        if (typeof formState === 'undefined') {
            throwError(
                `'mapStateToProps' for form ${name} returned undefined. Make sure`,
                `you add a selector function to the config object if you used`,
                `'combineReducers' to add forms to your redux.`,
            );
        }
        return formState;
    };
};

export const mapDispatch = <S extends object>(config: CompleteConfig<S>) => (
    dispatch: Dispatch<any>,
) => {
    const thunks = new ThunkFactory(config).getThunks();
    const {
        updateForm,
        clearForm,
        resetForm,
        showFormErrors,
        updateField,
        focusField,
        blurField,
        clearField,
        resetField,
        showFieldErrors,
        validateField,
        addArrayField,
        deleteArrayField,
    } = thunks;
    return {
        updateForm: (value: any) => dispatch(updateForm(value)),
        clearForm: () => dispatch(clearForm()),
        resetForm: () => dispatch(resetForm()),
        showFormErrors: (showErrors?: boolean) =>
            dispatch(showFormErrors(showErrors)),
        updateField: (key: string, value: any) =>
            dispatch(updateField(key, value)),
        focusField: (key: string) => dispatch(focusField(key)),
        blurField: (key: string) => dispatch(blurField(key)),
        clearField: (key: string) => dispatch(clearField(key)),
        resetField: (key: string) => dispatch(resetField(key)),
        validateField: (key: string) => dispatch(validateField(key)),
        showFieldErrors: (key: string, showErrors?: boolean) =>
            dispatch(showFieldErrors(key, showErrors)),
        addArrayField: (key: string) => dispatch(addArrayField(key)),
        deleteArrayField: (key: string, index: number) =>
            dispatch(deleteArrayField(key, index)),
    };
};

export const mergeFormProps = <S extends object>(config: CompleteConfig<S>) => (
    state: FormState<S>,
    dispatchers: object,
): FormProps<S> => {
    const methods = createFormMethods(config)(state, dispatchers);
    const { fields, extra } = state;
    const errors = Object.values(
        extract(fields, 'errors', {
            ignoreEmptyStrings: true,
            flatten: true,
        }),
    ).filter(err => !Array.isArray(err));
    const errorCount = errors.length;
    const select = createSelect(config)(state, dispatchers);
    const values = extract(state.fields, 'value') as S;
    return {
        name: config.name,
        ...methods,
        extra,
        errors,
        errorCount,
        valid: !errorCount,
        select,
        values,
    };
};

const createFormMethods = <S extends object>(config: CompleteConfig<S>) => (
    state: FormState<S>,
    dispatchers: any,
) => {
    const { updateForm, clearForm, resetForm, showFormErrors } = dispatchers;
    return {
        // TODO: allow set to update other properties
        set: (value: Partial<S>) => updateForm(value),
        clear: () => clearForm(),
        reset: () => resetForm(),
        showErrors: (showErrors?: boolean) => showFormErrors(showErrors),
        extract: (key: keyof SimpleFieldState, flatten: boolean = false) =>
            extract(state.fields, key, { flatten }),
        bind: createFormBinder(config),
    };
};

const createFormBinder = <S extends object>(
    config: CompleteConfig<S>,
) => (): FormBindProps<S> => {
    return pick(config, [
        'action',
        'name',
        'method',
        'onSubmit',
        'onChange',
        'onInput',
        'onInvalid',
    ]) as FormBindProps<S>;
};

const createSelect = <S extends object>(config: CompleteConfig) => (
    state: FormState<S>,
    dispatchers: any,
    prefix?: string,
) => (keyStr: string) => {
    const props = selectField(
        state,
        prefix ? `${prefix}.${keyStr}` : keyStr,
    ) as any;
    if (!props) {
        throwError(
            `Key '${keyStr}' does not correspond to an existing node in the state.`,
            `Check spelling and/or that the parent key is included.`,
        );
    }
    const methods = createFieldMethods(config)(keyStr, props, dispatchers);
    const { showErrors, extra, fields, fieldType } = props;
    const errors =
        fieldType === FieldType.Simple
            ? props.errors
            : flatten(
                  Object.values(extract(fields, 'errors', { flatten: true })),
              );
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
    if (props.fieldType === FieldType.Array) {
        common.length = fields.length;
        return common as ArrayFieldProps;
    }
    if (props.fieldType === FieldType.Parent) {
        return common as ParentFieldProps;
    }
    const errorMessage = showErrors && !valid ? errors[0] : '';
    const options = mapOptions(props, methods);
    return { ...common, errorMessage, options } as SimpleFieldProps;
};

const createFieldMethods = (config: CompleteConfig) => (
    key: string,
    props: FieldState,
    dispatchers: any,
) => {
    const {
        updateField,
        clearField,
        resetField,
        showFieldErrors,
        addArrayField,
        deleteArrayField,
    } = dispatchers;
    const common = {
        set: (value: any) => updateField(key, value),
        clear: () => clearField(key),
        reset: () => resetField(key),
        showErrors: (showErrors?: boolean) => showFieldErrors(key, showErrors),
    };
    if (props.fieldType === FieldType.Array) {
        return {
            ...common,
            add: () => addArrayField(key),
            del: (index: number) => deleteArrayField(key, index),
        };
    }
    if (props.fieldType === FieldType.Simple) {
        const { getter = v => v } = selectField(config, key, true) || {};
        return {
            ...common,
            bind: createFieldBinder(key, props, dispatchers, getter),
        };
    }
    return common;
};

const createFieldBinder = (
    key: string,
    props: any,
    dispatchers: any,
    getter: (value: any) => any,
) => (): FieldBindProps => {
    const { type, multiple } = props;
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
    const fetchedValue = getter(props.value);
    const { updateField, focusField, blurField } = dispatchers;
    const bindProps = {
        value: fetchedValue,
        ...inputProps,
        onChange: (e: SyntheticEvent<HTMLInputElement>, value?: InputValue) => {
            if (value !== undefined && value !== null) {
                updateField(key, value);
            } else if (type === 'select' && multiple) {
                const update = Array.from((e.target as any).options)
                    .filter((opt: any) => opt.selected)
                    .map((opt: any) => opt.value);
                updateField(key, update);
            } else {
                const { currentTarget, target } = e;
                const { checked, value: targetValue } = (currentTarget ||
                    target) as any;
                const setValue = type === 'checkbox' ? checked : targetValue;
                updateField(key, setValue);
            }
        },
        onBlur: () => blurField(key),
        onFocus: () => focusField(key),
    };
    return type === 'checkbox'
        ? { ...bindProps, checked: !!fetchedValue }
        : bindProps;
};

const mapOptions = (props: any, methods: any): undefined | MappedOption[] => {
    const { options, value, type } = props;
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
