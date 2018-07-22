// necessary import format
// see https://stackoverflow.com/questions/44547201/typescript-react-not-importing-correctly
import * as React from 'react';
import { localFormMap } from './connect';
import { logError } from './helpers/utils';
import { init } from './init';
import { LocalFormProps } from './typings';

const component = class <S extends object> extends React.Component<LocalFormProps<S>> {
    private readonly reducer: any;
    private readonly config: any;

    constructor(props: LocalFormProps<S>) {
        super(props);
        const { initialState, reducer, config } = init(props.config);
        this.state = initialState;
        this.reducer = reducer;
        this.config = config[props.config.name];
    }

    private dispatch = (action) => {
        if (typeof action === 'function') {
            action(this.dispatch, () => this.state);
        } else if ((action || {}).formName === this.config.name) {
            this.setState(prevState => this.reducer(prevState, action));
        } else {
            logError(`Skipping dispatch in LocalForm instance '${this.config.name}'.`);
        }
    }

    public render() {
        const { render } = this.props;
        const props = localFormMap(this.config)(this.state, this.dispatch);
        return render(props);
    }
};

// tslint:disable-next-line:variable-name
export const LocalForm = component as any;