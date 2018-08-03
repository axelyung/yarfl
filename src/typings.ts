import { SyntheticEvent } from 'react';
import { InferableComponentEnhancer } from 'react-redux';
import { Action as ReduxAction, Reducer as ReduxReducer } from 'redux';
import Validator from 'validatorjs';

export type InputValue = string | number | boolean | string[] | number[];

export interface Option extends Object {
    value: string|number|boolean;
    label: string;
}

export interface MappedOption extends Option {
    type: string;
    name: string;
    id: string;
}

export interface InputProps extends Object {
    value: InputValue;
    default: InputValue;
    name: string;
    id: string;
    className?: string;
    type: string;
    label: string;
    placeholder: string;
    multiple?: boolean;
    checked?: boolean;
    disabled: boolean;
    autoFocus: boolean;
    autoComplete: string;
}

interface Field extends Object {
    key: string;
    extra?: object;
    rules?: string;
}

interface WithFields<T extends ConfigField | FieldState> {
    fields: Model<any, T>;
}

interface WithFieldsArray<S> {
    fields: Model<S, SimpleFieldState>[];
}

export interface ConfigField extends InputProps, Field {
    options?: string[] | Option[];
    fields?: Model<any, Partial<ConfigField>>;
}

export interface CustomRule extends Object {
    name: string;
    callback: ((value: any, requirement: any, attribute: string) => boolean) |
        ((value: any, requirement: any, attribute: string, passes) => void);
    message: string;
}

type UnspecifiedState = any & object;

// TODO implement https://www.w3schools.com/tags/tag_form.asp
interface FormAttributes {
    action: string;
    name: string;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
    onSubmit?: () => any;
    onChange?: () => any;
    onInput?: () => any;
    onInvalid?: () => any;
}

interface ConfigBase extends FormAttributes {
    customRules: CustomRule[];
    errorMessages: Validator.ErrorMessages;
    mapState: (state: object) => FormState;
    // TODO: support multi lang support
    // useLang?: string;
    attributeFormatter?: (attribute: string) => string;
    autoParseNumbers: boolean;
    addDefaults: boolean;
    extra: object;
    validateOnInit: boolean;
    validateOnFocus: boolean;
    validateOnBlur: boolean;
    validateOnChange: boolean;
    validateOnClear: boolean;
    validateOnReset: boolean;
    validateOnAdd: boolean;
    validateOnDelete: boolean;
    showErrorsOnInit: boolean;
    showErrorsOnFocus: boolean;
    showErrorsOnBlur: boolean;
    showErrorsOnChange: boolean;
    showErrorsOnClear: boolean;
    showErrorsOnReset: boolean;
}

export interface Config<S extends object = UnspecifiedState> extends Partial<ConfigBase> {
    fields: PartialModel<S, ConfigField>;
    name: string;
}

export interface CompleteConfig<S extends object = UnspecifiedState> extends ConfigBase {
    fields: PartialModel<S, ConfigField>;
    name: string;
}

// tslint:disable-next-line:variable-name
export const FieldType = {
    Simple: 'SIMPLE',
    Parent: 'PARENT',
    Array: 'ARRAY',
};

interface StateFieldBase extends Object {
    path: string;
    fieldType: 'SIMPLE' | 'PARENT' | 'ARRAY';
    changed: boolean;
    touched: boolean;
    focused: boolean;
}

interface SimpleField extends StateFieldBase, Field, InputProps {
    fieldType: 'SIMPLE';
    errors: string[];
    initial: InputValue;
    options?: Option[];
}

export interface SimpleFieldState extends SimpleField {
    showErrors: boolean;
}

export interface ParentFieldState
    extends StateFieldBase, Field, WithFields<FieldState>{
    fieldType: 'PARENT';
}

export interface ArrayFieldState<S = any>
    extends StateFieldBase, Field, WithFieldsArray<S> {
    fieldType: 'ARRAY';
    default: Model<S, SimpleFieldState>;
}

export type FieldState = (SimpleFieldState | ParentFieldState | ArrayFieldState) & StateFieldBase;

// type Not<T> = Exclude<string, T>;

export interface FormState<S extends object = UnspecifiedState> extends FormAttributes {
    isAsync: boolean;
    extra: object;
    fields: Model<S, FieldState>;
}

export type Key<T> = keyof T;

export type Model<M extends Object, T> = Object & Record<keyof M, T>;

export type PartialModel<M extends Object, T> =
    Object & Record<keyof M, Partial<T>>;

export type StateWithForms<S extends Object = any> = Model<S, FormState>;

export interface FormsConnect extends InferableComponentEnhancer<any>,
    Record<string, InferableComponentEnhancer<any>> {}

/**
 * ACTION TYPES
 */
export interface Action extends ReduxAction {
    type: string;
    formName: string;
}
export interface ActionUnknown extends Action {          // action type
    key?: string;                   // what part of the state is being targeted
    value?: InputValue | object;    // value to commit to state
    index?: number;
    showErrors?: boolean;
    validator?: Validator.Validator<any>;
}

export interface ShowErrorsAction<hasKey extends boolean> extends Action {
    key: hasKey extends true ? string : undefined;
    showErrors: boolean;
}

export interface ActionWithKey extends Action {
    key: string;
}

export interface ActionWithValue<T = InputValue> extends Action {
    value: T;
}

export interface ActionWithKeyAndValue<T = InputValue> extends ActionWithKey {
    value: T;
}

export interface ActionWithKeyAndIndex extends ActionWithKey {
    index: number;
}

export interface ValidateAction<hasKey extends boolean, S = any> extends Action {
    key: hasKey extends true ? string : undefined;
    validator: Validator.Validator<S>;
}

export type Reducer<S extends object> = ReduxReducer<FormState<S>, ActionUnknown>;

export interface FormProps<S extends object> {
    name: string;
    set: (obj: Partial<S>) => void;
    clear: () => void;
    reset: () => void;
    select: (selector: string) => FieldProps;
    showErrors: (showErrors?: boolean) => void;
    extract: (key: keyof SimpleFieldState, flatten?: boolean) => object;
    bind: () => FormBindProps<S>;
    errors: string[];
    errorCount: number;
    valid: boolean;
    values: S;
    extra: object;
}

export interface FormBindProps<S> extends FormAttributes {
    onSubmit: (e?: SyntheticEvent<HTMLFormElement>, value?: S) => void;
    onChange: (e?: SyntheticEvent<HTMLInputElement>, value?: S) => void;
    onInput: (e?: SyntheticEvent<HTMLInputElement>) => any;
    onInvalid: (e?: SyntheticEvent<HTMLInputElement>) => any;
}

export type FormEvent = SyntheticEvent<HTMLFormElement>;
export type InputEvent = SyntheticEvent<HTMLInputElement>;

export interface FieldProps {
    set: (value: InputValue) => void;
    clear: () => void;
    reset: () => void;
    showErrors: (showErrors?: boolean) => void;
    bind: () => FieldBindProps;
    errors: string[];
    errorCount: number;
    errorMessage: string;
    valid: boolean;
    extra?: object;
    options?: MappedOption[];
    // size?: number;
    // length?: number;
}

export interface SimpleFieldProps extends FieldProps, SimpleField {
    options?: MappedOption[];
    bind: () => FieldBindProps;
}

export interface ParentFieldProps extends FieldProps, ParentFieldState {
    size: number;
}

export interface ArrayFieldProps extends FieldProps, ArrayFieldState {
    length: number;
}

export interface FieldBindProps extends InputProps {
    onChange: (e: SyntheticEvent<HTMLInputElement>, value?: any) => void;
    onBlur: () => void;
    onFocus: () => void;
}
