import creatorFactory from './actions/creatorFactory';
import {
    camelCase,
    firstDefined,
    kebabCase,
    titleCase,
} from './helpers/utils';
import { validatorFactory } from './helpers/validator';
import { createNewField } from './reducers/arrayReducer';
import { formShowErrorsReducer, formValidateReducer } from './reducers/formReducer';
import {
    CompleteConfig,
    ConfigField,
    FieldState,
    FieldType,
    FormState,
    MappedOption,
    Model,
    Option,
    PartialModel,
    SimpleFieldState,
} from './typings';

export const initializeFormState = <S extends object>(config: CompleteConfig<S>, isAsync: boolean = false): FormState<S> => {
    const {
        name,
        extra = {},
        action = '',
        method = 'POST',
    } = config;
    const fields = initFields(config.fields, config.addDefaults);
    const state = {
        action,
        name,
        method,
        fields,
        isAsync,
        extra,
    };
    return initHooks(config, state as any);
};

const initHooks = (config: CompleteConfig, state: FormState) => {
    const { showErrorsOnInit, validateOnInit } = config;
    if (showErrorsOnInit) {
        const { showFormErrors, validateForm } = creatorFactory(config);
        const showErrorsAction = showFormErrors(true);
        const updated = formShowErrorsReducer(config)(state, showErrorsAction);
        const validator = validatorFactory(config)(state);
        const validateAction = validateForm(validator);
        return formValidateReducer(config)(updated, validateAction);
    }
    if (validateOnInit) {
        const validator = validatorFactory(config)(state);
        const validateAction = creatorFactory(config).validateForm(validator);
        return formValidateReducer(config)(state, validateAction);
    }
    return state;
};

const initFields = <S = any>(fields: PartialModel<S, ConfigField>, addDefaults: boolean = true): Model<S, FieldState> => {
    const entries = Object.entries(fields) as [string, ConfigField][];
    return entries.map(([key, field]) => ({ [key]: initField(key, field, addDefaults) }))
        .reduce((prev, curr) => ({ ...prev, ...curr })) as Model<S, FieldState>;
};

const initField = <K extends string>(key: K, field: ConfigField, addDefaults: boolean): FieldState => {
    const common = {
        key,
        focused: false,
        touched: false,
        changed: false,
        showErrors: false,
        extra: field.extra || {},
    };
    if (field.fields) {
        const fields = initFields(field.fields);
        if (field.multiple) {
            return {
                ...common,
                fieldType: FieldType.Array,
                default: fields,
                fields: [createNewField(key, fields, 0)],
            } as any;
        }
        return { ...common, fields, fieldType: FieldType.Parent } as any;
    }
    const errors: string[] = [];
    if (!addDefaults) {
        return {
            ...common,
            value: '',
            rules: '',
            errors,
            ...field,
        } as SimpleFieldState;
    }
    const rules = firstDefined(field.rules, '');
    const name = firstDefined(field.name, key);
    const autoComplete = firstDefined(field.autoComplete, name);
    const id = firstDefined(field.id, kebabCase(name));
    const label = firstDefined(field.label, titleCase(name));
    const placeholder = firstDefined(field.placeholder, label);
    const disabled = firstDefined(!!field.disabled, false);
    const autoFocus = firstDefined(!!field.autoFocus, false);
    const multiple = field.multiple;
    const value = firstDefined(field.value, field.default, multiple ? [] : '');
    const dfault = firstDefined(field.default, multiple ? [] : '');
    const type = firstDefined(field.type, inputType(value));
    const options = field.options
        ? optionMapper(field.options, id, name, key, type)
        : undefined;
    const props = {
        ...common,
        fieldType: FieldType.Simple,
        value: type === 'checkbox' ? !!value : value,
        default: dfault,
        initial: value,
        rules,
        name,
        id,
        type,
        label,
        placeholder,
        disabled,
        autoFocus,
        autoComplete,
        errors,
    };
    return (options ? { ...props, options, multiple } : props) as SimpleFieldState;
};

const optionMapper = (options: string[] | Option[], id: string, name: string, key: string, type: string): MappedOption[] => {
    if (!options.length) {
        return [];
    }
    const optionType = typeof options[0];
    if (optionType !== 'object' && optionType !== 'string')
        throw new Error(`'options' for field '${key}' must be defined as an array of strings or objects ({ value, label })`);

    // 'selected' for option elements and 'checked' for radio buttons and checkboxes
    return (options as Option[]).map((opt: Option | string): MappedOption => {
        const { value, label } = typeof opt === 'string' ? { value: opt, label: opt } : opt;
        return {
            type,
            value,
            label,
            name: camelCase(`${name} ${value}`),
            id: kebabCase(`${id} ${value}`),
        };
    });
};

const inputType = (test: any) => {
    switch (typeof test) {
        case 'string':
            return 'text';
        case 'number':
            return 'number';
        case 'boolean':
            return 'checkbox';
        default:
            return 'text';
    }
};
