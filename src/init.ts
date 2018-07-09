import * as React from 'react';
import { InferableComponentEnhancer } from 'react-redux';
import { combineReducers, compose } from 'redux';
import ThunkFactory from './actions/ThunkFactory';
import { connectDirectly } from './connect';
import { FormProviderComponent } from './FormProvider';
import { checkConfigs } from './helpers/checkers';
import { mergeDeep } from './helpers/utils';
import { registerCustomRules, reigsterErrorMessages } from './helpers/validator';
import { initializeFormState } from './initializeState';
import { createReducer } from './reducers';
import {
    CompleteConfig,
    Config,
    FormProviderProps,
    FormsConnect,
    Model,
    StateWithForms,
    } from './typings';

export function init(...configs: Config[]) {
    checkConfigs(configs);
    const forms = configs.map(initForm);
    const mergedForms = forms.reduce((acc, curr) => {
        // tslint:disable-next-line:no-shadowed-variable
        const {
            initialState,
            reducer,
            formProvider,
            config,
            connect:c,
            actionCreators,
        } = curr;
        const { name } = config;
        return mergeDeep(acc, {
            initialState,
            reducers: { [name]: reducer },
            formProviders: { [name]: formProvider },
            config: { [name]: config },
            connectors: { [name]: c },
            actionCreators: { [name]: actionCreators },
        });
    }, {}) as any;
    const { reducers, connectors, formProviders } = mergedForms as any;
    const connect = compose(...Object.values(connectors) as InferableComponentEnhancer<any>[]) as FormsConnect;
    Object.entries(connectors).forEach(([key, connector]: [string, any]) => {
        connect[key] = connector;
    });
    // tslint:disable-next-line:variable-name
    const FormProvider = connect(FormProviderComponent) as any;
    Object.entries(formProviders).forEach(([key, formProvider]: [string, any]) => {
        (FormProvider as any)[key] = formProvider as React.ComponentClass<FormProviderProps<any>>;
    });
    return {
        initialState: mergedForms.initialState as StateWithForms,
        config: mergedForms.config as Model<{}, CompleteConfig>,
        connect,
        reducer: combineReducers(reducers),
        FormProvider,
        actionCreators: mergedForms.actionCreators, // as Model<any, ActionCreators>,
    };
}

const initForm = <S extends object>(config: Config<S>) => {
    const { customRules, errorMessages } = config;
    const isAsync = customRules && customRules.length
        ? registerCustomRules(customRules)
        : false;
    if (errorMessages) {
        reigsterErrorMessages(errorMessages);
    }
    const configWithDefaults = addDefaultsToConfig(config);
    const initialFormState = initializeFormState(configWithDefaults, isAsync);
    const reducer = createReducer(configWithDefaults, initialFormState);
    const connect = connectDirectly(configWithDefaults);
    const formProvider = connect(FormProviderComponent);
    // TODO: include option to return selectors
    const actionCreators = new ThunkFactory(configWithDefaults).getThunks();
    const initialState = { [config.name]: initialFormState };
    return {
        initialState,
        reducer,
        connect,
        formProvider,
        config: configWithDefaults,
        actionCreators,
    };
};

const addDefaultsToConfig = <S extends object>(config: Config<S>): CompleteConfig<S> => {
    return {
        // useLang?: string;
        method: 'POST',
        customRules: [],
        errorMessages: {},
        validateOnInit: true,
        validateOnFocus: false,
        validateOnBlur: true,
        validateOnChange: true,
        validateOnClear: true,
        validateOnReset: true,
        validateOnAdd: true,
        validateOnDelete: true,
        showErrorsOnInit: false,
        showErrorsOnFocus: false,
        showErrorsOnBlur: true,
        showErrorsOnChange: false,
        showErrorsOnClear: false,
        showErrorsOnReset: false,
        autoParseNumbers: true,
        skipDefaults: false,
        mapState: (state: any) => state[config.name],
        ...config,
    } as CompleteConfig<S>;
};