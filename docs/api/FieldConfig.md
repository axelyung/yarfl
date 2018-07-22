# `FieldConfig`

Each field in the form is defined as an object, but all config properties are optional. Default values will be generated when omitted in the config. Many properties are mapped to input attributes when using the `bind()` method.

| Property       |    Type   |  Default | Included in `bind()` | Description                                                                                                                                                                                                                                                |
|----------------|:---------:|:--------:|:--------------------:|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `value`        |   `any`   |   `''`   |  :white_check_mark:  | Initial field value on form initialization.                                                                                                                                                                                                                |
| `rules`        |  `string` |   `''`   |                      | String of pipe (<code>&#124;</code>) separated validation rules. See `validatorjs` implementation [here](https://github.com/skaterdav85/validatorjs#available-rules).                                                                                      |
| `default`      |   `any`   |  `value` |  :white_check_mark:  | Default field value. Sets to this value on `rv.reset()`. Defaults to previous `value` property.                                                                                                                                                            |
| `name`         |  `string` |   `key`  |  :white_check_mark:  | Defaults to field `key` if not provided.                                                                                                                                                                                                                   |
| `id`           |  `string` |   `key`  |  :white_check_mark:  | Defaults to `name` in kebab case if not provided.                                                                                                                                                                                                          |
| `className`    |  `string` |          |  :white_check_mark:  | Field `className`.                                                                                                                                                                                                                                         |
| `type`         |  `string` | `'text'` |  :white_check_mark:  | Field type, defaults to `'text'`.                                                                                                                                                                                                                          |
| `label`        |  `string` |  `name`  |  :white_check_mark:  | Defaults to `name` in title case if not provided.                                                                                                                                                                                                          |
| `placeholder`  |  `string` |  `name`  |  :white_check_mark:  | Defaults to `name` in title case if not provided.                                                                                                                                                                                                          |
| `multiple`     | `boolean` |          |  :white_check_mark:  | Valid only if `options` is defined. Defaults to `false` if options is given.                                                                                                                                                               |
| `disabled`     | `boolean` |  `false` |  :white_check_mark:  | Defaults to `false`.                                                                                                                                                                                                                                       |
| `autoFocus`    | `boolean` |  `false` |  :white_check_mark:  | Defaults to `false`.                                                                                                                                                                                                                                       |
| `autoComplete` |  `string` |  `name`  |  :white_check_mark:  | Defaults to `name`.                                                                                                                                                                                                                                        |
| `options`      |  `array`  |          |                      | An array of `string` or `object` specifying options for use with `select` or `radio` fields. An option `object` follows `{ label: string, value: any }` format. If an array of strings is given then both `label` and `value` are set to the string value. |
| `extra`        |  `object` |   `{}`   |                      | An optional property to store extra information about the form. Useful for storing header/label values, metadata and/or custom behavior.                                                                                                                   |

## Example

A form initialized with the following config...

```javascript
const config = {
    name: 'loginForm'
    fields: {
        email: {
            name: 'loginEmail',
            label: 'Enter your email',
            rules: 'required|email',
        }
        ...
    }
}
```

Will result in the following field state:

```javascript
{
   key: 'email',
   focused: false,
   touched: false,
   changed: false,
   showErrors: false,
   extra: {},
   fieldType: 'SIMPLE',
   value: '',
   default: '',
   initial: '',
   rules: 'required|email',
   name: 'loginEmail',
   id: 'login-email',
   type: 'text',
   label: 'Enter your email',
   placeholder: 'Enter your email',
   disabled: false,
   autoFocus: false,
   autoComplete: 'loginEmail',
   errors: [ 'The email field is required.' ]
}
```