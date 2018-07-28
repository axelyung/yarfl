import { configure, mount } from 'enzyme';
import * as Adapter16 from 'enzyme-adapter-react-16';
import * as React from 'react';
import { Provider } from 'react-redux';
import { LocalForm } from 'src/LocalForm';
import { FormProps } from 'src/typings';
import { createTestAssets } from './utils';

// setup React adapter
configure({ adapter: new Adapter16() });

export class PropsTarget extends React.Component<FormProps<any>>{
    public render() {
        return <div>test</div>;
    }
}

// tslint:disable-next-line:variable-name
const createConsumerWithFormProvider = (store, FormProvider) => {
    return React.createElement(class extends React.Component {
        public render() {
            return (
                <Provider store={store}>
                    <FormProvider render={props => <PropsTarget {...props} />}/>
                </Provider>
            );
        }
    });
};

const createConsumerWithConnect = (store, connect) => {
    // tslint:disable-next-line:variable-name
    const ConnectedPropsTarget = connect(PropsTarget);
    return React.createElement(class extends React.Component {
        public render() {
            return (
                <Provider store={store}>
                    <ConnectedPropsTarget />
                </Provider>
            );
        }
    });
};

export const mountLocalForm = (config) => {
    const props = {
        config,
        render:(targetProps) => <PropsTarget {...targetProps} />,
    };
    const wrapper = mount(<LocalForm {...props} />);
    return {
        wrapper,
        getState: () => wrapper.state(),
        getFormProps: () => wrapper.find(PropsTarget).props(),
    };
};

export const mountGenericConnectedComponent = (config) => {
    const { store, connect } = createTestAssets(config);
    const target = createConsumerWithConnect(store, connect);
    const wrapper = mount(target);
    return {
        getState: store.getState,
        // @ts-ignore
        getFormProps: () => wrapper.find(PropsTarget).props().hybridForm,
    };
};

export const mountNamedConnectedComponent = (config) => {
    const { store, connect } = createTestAssets(config);
    const target = createConsumerWithConnect(store, connect.hybridForm);
    const wrapper = mount(target);
    return {
        getState: store.getState,
        // @ts-ignore
        getFormProps: () => wrapper.find(PropsTarget).props().hybridForm,
    };
};

export const mountGenericFormProviderComponent = (config) => {
    const { store, FormProvider } = createTestAssets(config);
    const target = createConsumerWithFormProvider(store, FormProvider);
    const wrapper = mount(target);
    return {
        getState: store.getState,
        // @ts-ignore
        getFormProps: () => wrapper.find(PropsTarget).props().hybridForm,
    };
};

export const mountNamedFormProviderComponent = (config) => {
    const { store, FormProvider } = createTestAssets(config);
    const target = createConsumerWithFormProvider(store, FormProvider);
    const wrapper = mount(target);
    return {
        getState: store.getState,
        // @ts-ignore
        getFormProps: () => wrapper.find(PropsTarget).props().hybridForm,
    };
};
