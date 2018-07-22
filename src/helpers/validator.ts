import * as Validator from 'validatorjs';
import { CompleteConfig, CustomRule, FormState } from '../typings';
import { extract, titleCase } from './utils';

const common = <S extends object>(config: CompleteConfig<S>) => (state: FormState<S>) => {
    const { errorMessages, attributeFormatter } = config;
    const { fields } = state;
    const data = extract(fields, 'value', { flatten: true }) as S;
    const rules = extract(fields, 'rules', { ignoreEmptyStrings: true, flatten: true });
    // TODO: make this a configurable action
    const validation = (errorMessages as any || []).length
        ? new Validator<S>(data, rules, errorMessages)
        : new Validator<S>(data, rules);
    validation.setAttributeFormatter(attributeFormatter || defaultAttributeFormatter);
    return validation;
};

const defaultAttributeFormatter = (attribute: string) => {
    return titleCase(attribute.split('.').reverse()[0]).toLowerCase();
};

export const validatorFactory = <S extends object>(config: CompleteConfig<S>) => (state: FormState<S>) => {
    const validation = common(config)(state);
    validation.check(); // to trigger validation
    return validation;
};

export const asyncValidatorFactory = <S extends object>(config: CompleteConfig<S>) => (state: FormState<S>) => {
    const validation = common(config)(state);

    return new Promise<Validator.Validator<{}>>(resolve => {
        validation.checkAsync(() => resolve(validation), () => resolve(validation));
    });
};

export const registerCustomRules = (customRules: CustomRule[]) => {
    return customRules.map(rule => {
        const { name, callback, message } = rule;
        if (callback.length > 3) {
            Validator.registerAsync(name, callback, message);
            return true;
        }
        Validator.register(name, callback, message);
        return false;
    }).some(isAsync => isAsync);
};

export const reigsterErrorMessages = (messages: Validator.ErrorMessages) => {
    Validator.setMessages('', messages);
};