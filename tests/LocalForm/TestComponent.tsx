import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { FormProps } from '../../src/types';

class PropsTarget extends React.Component<{ [key: string]: FormProps<any> }>{
    public render() {
        return (
            <div>test</div>
        );
    }
}

export const mountAndReturnProps = (store, connect) => {
    // tslint:disable:variable-name
    const ConnectedTarget = connect(PropsTarget);
    const TestComponent = class extends React.Component {
        public render() {
            return <Provider store={store}><ConnectedTarget/></Provider>;
        }
    };
    return mount(<TestComponent />).find(PropsTarget).props();
};