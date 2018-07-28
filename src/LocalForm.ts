// necessary import format
// see https://stackoverflow.com/questions/44547201/typescript-react-not-importing-correctly
import * as _equals from 'ramda/src/equals';
import * as React from 'react';
import { localFormMap } from './connect';
import { logWarning } from './helpers/utils';
import { init } from './init';
import { LocalFormProps } from './typings';

const component = class <S extends object> extends React.Component<LocalFormProps<S>> {
    private reducer: any;
    private config: any;

    constructor(props: LocalFormProps<S>) {
        super(props);
        this.initialize(true);
    }

    public componentDidUpdate(prevProps: LocalFormProps<S>) {
        const { config: oldConfig } = prevProps;
        const { config: newConfig } = this.props;
        // check if config prop name has changed
        if (!_equals(oldConfig, newConfig)) {
            this.initialize();
        }
    }

    private initialize = (beforeMount = false) => {
        // create yarfl/redux assets with init function
        const { name: newFormName } = this.props.config;
        const oldFormName = (this.config || {}).name;
        const { initialState, reducer, config } = init(this.props.config);

        this.reducer = reducer;
        this.config = config[newFormName];
        if (beforeMount) {
            // if component has not been mounted set directly
            this.state = initialState;
        } else {

            // if component is mounted use setState to set new form
            // before updating config, reducer and setting the old
            // form to undefined
            this.setState({
                [oldFormName]: undefined,
                ...initialState,
            });
        }
    }

    // this dispatch takes the place of what would be Redux's dispatch
    // if the store were being used
    private dispatch = (action) => {
        if (typeof action === 'function') {
            // dispatch thunk like actions
            return action(this.dispatch, () => this.state);
        }
        const { formName } = action;
        const formDefined = !!(this.state || {})[formName];
        // skip dispatching action if the target form is missing
        if (formDefined) {
            return this.setState(prevState =>  this.reducer(prevState, action));
        }
        logWarning(`Skipping dispatch in LocalForm instance '${this.config.name}'.`);
    }

    public render() {
        const { render } = this.props;
        const props = localFormMap(this.config)(this.state, this.dispatch);
        return render(props);
    }
};

// tslint:disable-next-line:variable-name
export const LocalForm = component as any;
