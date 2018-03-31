// necessary import format
// see https://stackoverflow.com/questions/44547201/typescript-react-not-importing-correctly
import * as React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import { init } from './init';
import { LocalFormProps } from './types';

// TODO: implement a providerless solution, see https://nickdrane.com/write-your-own-redux-connect/
const component = class <S extends object> extends React.Component<LocalFormProps<S>> {
    private readonly store: Store;
    private readonly formProvider: any;

    constructor(props: LocalFormProps<S>) {
        super(props);
        const { initialState, reducer, FormProvider } = init(props.config);
        this.state = initialState;
        this.formProvider = FormProvider;
        this.store = createStore(reducer, initialState, applyMiddleware(thunk));
    }

    public render() {
        const { render } = this.props;
        const formProvider = React.createElement(this.formProvider, { render });
        return React.createElement(Provider, { store: this.store }, formProvider);
    }
};

// tslint:disable-next-line:variable-name
export const LocalForm = component as any;