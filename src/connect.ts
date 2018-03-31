import { SyntheticEvent } from 'react';
import {
  connect, Options,
} from 'react-redux';
import { Dispatch } from 'redux';
import { thunkFactory } from './actions/thunks';
import {
  extract,
  pick,
  selectField,
  throwError,
} from './helpers/utils';
import {
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
} from './types';

export const createConnector = <S extends object>(config: CompleteConfig<S>) => (
  mapStateToProps?: any,
  mapDispatchToProps?: any,
  mergeProps?: any,
  options?: any,
) => {
    const extendedMapState = (state: object) => {
        return {
            REDUX_VALIDATED: config.mapState(state),
            ...(mapStateToProps ? mapStateToProps(state) : {}),
        };
    };
    const extendedMapDispatch = (dispatch: Dispatch<any>) => ({
        REDUX_VALIDATED: mapDispatch(config)(dispatch),
        ...(mapDispatchToProps ? mapDispatchToProps(dispatch) : {}),
    });
    const extendedMergeProps = (
    stateProps: any,
    dispatchProps: any,
    ownProps: object,
  ) => {
        const formState = stateProps.REDUX_VALIDATED;
        const formDispatchers = dispatchProps.REDUX_VALIDATED;
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
    const thunks = thunkFactory(config);
    thunks.updateField.bind(thunks);
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
    } = thunks;
    return {
        updateForm: (value: any) => dispatch(updateForm(value)),
        clearForm: () => dispatch(clearForm()),
        resetForm: () => dispatch(resetForm()),
        showFormErrors: (showErrors?: boolean) =>
            dispatch(showFormErrors(showErrors)),
        updateField: (key: string, value: any) => dispatch(updateField(key, value)),
        focusField: (key: string) => dispatch(focusField(key)),
        blurField: (key: string) => dispatch(blurField(key)),
        clearField: (key: string) => dispatch(clearField(key)),
        resetField: (key: string) => dispatch(resetField(key)),
        validateField: (key: string) => dispatch(validateField(key)),
        showFieldErrors: (key: string, showErrors?: boolean) =>
            dispatch(showFieldErrors(key, showErrors)),
    };
};

export const mergeFormProps = <S extends object>(config: CompleteConfig<S>) => (
  state: FormState<S>,
  dispatchers: object,
): FormProps<S> => {
    const methods = createFormMethods(config)(state, dispatchers);
    const props = createFormProps()(state);
    const select = createSelect()(state, dispatchers);
    const values = extract(state.fields, 'value') as S;
    return {
        ...methods,
        ...props,
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

const createFormProps = () => (state: FormState) => {
    const errors = Object.values(extract(state.fields, 'errors', { flatten: true }));
    const errorCount = 1;
    return {
        errors,
        errorCount,
        valid: !!errorCount,
    };
};

const createSelect = <S extends object>() => (
  state: FormState<S>,
  dispatchers: any,
) => (keyStr: string): SimpleFieldProps | ParentFieldProps => {
    const props = selectField(state, keyStr) as any;
    if (!props) {
        throwError(
            `Key '${keyStr}' does not correspond to an existing node in the state.`,
            `Check spelling and/or that the parent key is included.`,
        );
    }
    const methods = createFieldMethods(keyStr, props, dispatchers);
    const { errors, showErrors } = props;
    const errorCount = errors
        ? errors.length
        : Object.values(extract(props.fields, 'errors', { flatten: true }))
            .reduce((acc, curr) => [...acc, ...curr], []);
    const valid = !errorCount;
    const common = {
        ...props,
        ...methods,
        errors,
        errorCount,
        valid,
    };
    if (props.fieldType === FieldType.Parent) {
        return common as ParentFieldProps;
    }
    const errorMessage = showErrors && !valid ? errors[0] : '';
    const options = mapOptions(props, methods);
    return { ...common, errorMessage, options } as SimpleFieldProps;
};

const createFieldMethods = (
    key: string,
    props: FieldState,
    dispatchers: any) => {
    const { updateField, clearField, resetField, showFieldErrors } = dispatchers;
    const common = {
        set: (value: any) => updateField(key, value),
        clear: () => clearField(key),
        reset: () => resetField(key),
        showErrors: (showErrors?: boolean) => showFieldErrors(key, showErrors),
    };
    return props.fieldType === FieldType.Simple
        ? { ...common, bind: createFieldBinder(key, props, dispatchers) }
        : common;
};

const createFieldBinder = (
  key: string,
  props: any,
  dispatchers: any,
) => (): FieldBindProps => {
    const { type, multiple } = props;
    const inputProps = pick(props, [
        'value',
        'default',
        'id',
        'type',
        'label',
        'placeholder',
        'name',
        'disabled',
        'autoFocus',
        'multiple',
        'autoComplete',
    ]) as InputProps;
    const { updateField, focusField, blurField } = dispatchers;
    return {
        ...inputProps,
        onChange: (e: SyntheticEvent<HTMLInputElement>, value?: InputValue) => {
            if (value !== undefined) {
                updateField(key, value);
            } else if (type === 'select' && multiple) {
                const update = Array.from((e.target as any).options)
                    .filter((opt: any) => opt.selected)
                    .map((opt: any) => opt.value);
                updateField(key, update);
            } else {
                const { currentTarget, target } = e;
                const { checked, value: targetValue } = (currentTarget || target) as any;
                const setValue = type === 'checkbox' ? checked : targetValue;
                updateField(key, setValue);
            }
        },
        onBlur: () => blurField(key),
        onFocus: () => focusField(key),
    };
};

const mapOptions = (props: any, methods: any): undefined | MappedOption[] => {
    const { options, value, type } = props;
    if (!options || !Array.isArray(options) || !options.length)
        return [];

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
