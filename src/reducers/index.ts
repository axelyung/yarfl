import { createArrayReducer } from '../reducers/arrayReducer';
import { createFieldReducer } from '../reducers/fieldReducer';
import { createFormReducer } from '../reducers/formReducer';
import { createNodeReducer } from '../reducers/nodeReducer';
import {
    ActionUnknown,
    CompleteConfig,
    FormState,
    Reducer,
    } from '../typings';

export const createReducer = <S extends object>(config: CompleteConfig<S>, initialState: FormState<S>): Reducer<S> => {
    const fieldReducer = createFieldReducer(config);
    const arrayReducer = createArrayReducer();
    const nodeReducer = createNodeReducer(config);
    const formReducer = createFormReducer(config);
    return (state: FormState<S> = initialState, action: ActionUnknown): FormState<S> => {
        if ((action || {}).formName === config.name) {
            const fieldReduction = fieldReducer(state, action);
            const arrayReduction = arrayReducer(fieldReduction, action);
            const nodeReduction = nodeReducer(arrayReduction, action);
            return formReducer(nodeReduction, action);
        }
        return state;
    };
};