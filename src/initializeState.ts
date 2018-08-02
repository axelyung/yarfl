import creatorFactory from './actions/creatorFactory';
import { camelCase, firstDefined, kebabCase, mergeDeep, titleCase } from './helpers/utils';
import { validatorFactory } from './helpers/validator';
import { createNewField } from './reducers/arrayReducer';
import { formShowErrorsReducer, formValidateReducer } from './reducers/formReducer';
import {
    ArrayFieldState,
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
    const fields = initFields(config.fields, !!config.addDefaults, '');
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
        return showStateErrors(config, state);
    }
    if (validateOnInit) {
        return validateState(config, state);
    }
    return state;
};

const showStateErrors = (config: CompleteConfig, state: FormState) => {
    const { showFormErrors } = creatorFactory(config);
    const showErrorsAction = showFormErrors(true);
    const updated = formShowErrorsReducer(config)(state, showErrorsAction);
    return validateState(config, updated);
};

const validateState = (config: CompleteConfig, state: FormState) => {
    const { validateForm } = creatorFactory(config);
    const validator = validatorFactory(config)(state);
    const validateAction = validateForm(validator);
    return formValidateReducer(config)(state, validateAction);
};

const initFields = <S = any>(fields: PartialModel<S, ConfigField>, addDefaults: boolean, parentPath: string): Model<S, FieldState> => {
    const entries = Object.entries(fields) as [string, ConfigField][];
    return entries.map(([key, field]) => ({ [key]: initField(key, field, addDefaults, parentPath) }))
        .reduce((prev, curr) => ({ ...prev, ...curr })) as Model<S, FieldState>;
};

const initField = <K extends string>(key: K, field: ConfigField, addDefaults: boolean, parentPath: string): FieldState => {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const common = {
        key,
        path,
        focused: false,
        touched: false,
        changed: false,
        showErrors: false,
        extra: field.extra || {},
    };
    if (Array.isArray(field.fields)) {
        // field.fields && field.multiple implies array field
        const dfault = initFields(field.default as any, addDefaults, path);
        return {
            ...common,
            fieldType: FieldType.Array,
            default: dfault,
            fields: field.fields.map((f, index) => {
                const newField = createNewField(key, dfault, index);
                return mergeDeep(newField, f);
            }),
        } as ArrayFieldState;
    }
    if (field.fields) {
        const fields = initFields(field.fields, addDefaults, path);
        return { ...common, fields, fieldType: FieldType.Parent } as any;
    }
    const errors: string[] = [];
    if (!addDefaults) {
        return {
            ...common,
            fieldType: FieldType.Simple,
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
    const type = firstDefined(field.type, inputType(value));
    const props = {
        ...common,
        fieldType: FieldType.Simple,
        value: type === 'checkbox' ? !!value : value,
        default: firstDefined(field.default, multiple ? [] : ''),
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
    return (field.options
        ? {
            ...props,
            options: optionMapper(field.options, id, name, key, type),
            multiple,
        }
        : props) as SimpleFieldState;
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
