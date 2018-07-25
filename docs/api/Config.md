# `Config`

The config object defines a form's fields, behavior and initial state.

| Property             |    Type    |         Default        | Description                                                                                                                                                                                                                                              |
|----------------------|:----------:|:----------------------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`               |  `string`  |       (required)       | The name to map the form state to in redux (pick a name that won't conflict with other state nodes or form names)                                                                                                                                        |
| `fields`             |  `object`  |       (required)       | An object of `FieldConfig` properties (`{ [key: string]: FieldConfig }`). See the [`FieldConfig` definition](./FieldConfig.md).                                                                                                                                                                |
| `customRules`        |   `array`  |                        | An array of custom rules to use when defining fields. See `validatorjs` implementation [here](https://github.com/skaterdav85/validatorjs#register-custom-validation-rules).                                                                              |
| `errorMessages`      |  `object`  |                        | An array of custom error messages registered as objects (`{ name, callback, message })`. See `validatorjs` implementation [here](https://github.com/skaterdav85/validatorjs#custom-error-messages) for more details.                                                                                                            |
| `mapState`           | `function` | `state => state[name]` | A selector function to pick out the form from the state tree. By default this is set to select the property on the first level of the state tree matching the `name` property. This property should only be explicitly set when using `combineReducers`. |
| `addDefaults`        |  `boolean` |         `true`         | Automatically add values for missing missing `config` and `field` attributes. For example, if a `field` with key `'firstName'` is not explicitly given an `id`, it will automatically be set to `'first-name'`.                                          |
| `extra`              |  `object`  |          `{}`          | An optional property to store extra information about the form. Useful for storing header/label values, metadata and/or custom behavior.                                                                                                                 |
| `validateOnInit`     |  `boolean` |         `true`         | Validate fields on initialization.                                                                                                                                                                                                                  |
| `validateOnFocus`    |  `boolean` |         `false`        | Validate fields on focus.                                                                                                                                                                                                                                |
| `validateOnBlur`     |  `boolean` |         `true`         | Validate fields on blur.                                                                                                                                                                                                                                 |
| `validateOnChange`   |  `boolean` |         `true`         | Validate fields on change.                                                                                                                                                                                                                               |
| `validateOnClear`    |  `boolean` |         `true`         | Validate fields on clear.                                                                                                                                                                                                                                |
| `validateOnReset`    |  `boolean` |         `true`         | Validate fields on reset.                                                                                                                                                                                                                                |
| `showErrorsOnInit`   |  `boolean` |         `false`        | Display errors on initialization.                                                                                                                                                                                                                   |
| `showErrorsOnFocus`  |  `boolean` |         `false`        | Display errors on focus.                                                                                                                                                                                                                                 |
| `showErrorsOnBlur`   |  `boolean` |         `true`         | Display errors on blur.                                                                                                                                                                                                                                  |
| `showErrorsOnChange` |  `boolean` |         `false`        | Display errors on change.                                                                                                                                                                                                                                |
| `showErrorsOnClear`  |  `boolean` |         `false`        | Display errors on clear.                                                                                                                                                                                                                                 |
| `showErrorsOnReset`  |  `boolean` |         `false`        | Display errors on reset.                                                                                                                                                                                                                                 |

## Example

```javascript
export const basicConfig = {
    name: 'basicForm',
    fields: {
        name: {
            value: '',
            default: 'John Doe',
            rules: 'required',
        },
        password: {
            type: 'password',
            rules: 'required|pwCheck',
        },
        passwordConfirm: {
            type: 'password',
            rules: 'required|same:password',
        },
        email: {
            type: 'email',
            rules: 'required|email',
        },
    },
    customRules: [
        {
            name: 'pwCheck',
            callback: value => value.toString().toLowerCase() === 'password',
            message: "The password cannot be \"password\"",
        },
    ],
    errorMessages: {
        required: 'You forgot the :attribute field!'
    }
    mapState: state => state.forms.basicForm,
    extra: {
        title: 'Basic Form',
        subtitle: 'A basic example of a yarlf form',
    },
};
```
