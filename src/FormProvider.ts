// necessary import format
// see https://stackoverflow.com/questions/44547201/typescript-react-not-importing-correctly
import * as React from 'react';
import { checkForRenderProp } from './helpers/checkers';
import { FormProviderProps } from './typings';

export class FormProviderComponent<S extends object> extends React.Component<FormProviderProps<S>> {
    public render() {
        const { render, ...other } = checkForRenderProp<S, any>(this.props);
        return render(other);
    }
}

export interface FormProvider<S extends object> extends React.Component<FormProviderProps<S>> {}
