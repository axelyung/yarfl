import * as React from 'react';
import { InferableComponentEnhancer } from 'react-redux';
import { combineReducers, compose } from 'redux';
import { thunkFactory } from './actions/thunks';
import { connectDirectly } from './connect';
import { FormProviderComponent } from './FormProvider';
import { checkConfigs } from './helpers/checkers';
import { addDefaultsToConfig, mergeDeep } from './helpers/utils';
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
    } from './types';

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

function initForm<S extends object>(config: Config<S>) {
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
    const actionCreators = thunkFactory(configWithDefaults);
    const initialState = { [config.name]: initialFormState };
    return {
        initialState,
        reducer,
        connect,
        formProvider,
        config: configWithDefaults,
        actionCreators,
    };
}
