# `Form`

The form prop passed to the component by `connect` (or render prop in the case of `FormProvider`/`LocalForm`) contains computed properties about the state of the form and a collection of methods for dispatching actions to the store.

| Property     |    Type    | Description                                                                                                                                                                                                                                                                      |
|--------------|:----------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`       |  `string`  | The name of the form.                                                                                                                                                                                                                                                            |
| `values`     |  `object`  | The values of the form.                                                                                                                                                                                                                                                          |
| `valid`      |  `boolean` | Whether all fields pass their validation rules.                                                                                                                                                                                                                                  |
| `errors`     |   `array`  | An array of all the error messages for each field failing validation.                                                                                                                                                                                                            |
| `errorCount` |  `number`  | The total number of validation errors (equal to the length of errors).                                                                                                                                                                                                           |
| `extra`      |  `object`  | The `extra` property specified in `config`.                                                                                                                                                                                                                                      |
| `set`        | `function` | Set one or several field values at once. Accepts an object matching the form's schema. For example, in the case of the form defined [here](./Config.md#example), calling `select({ name: 'Axel Yung', email: 'axelyung@gmail.com' })` will update the `name` and `email` fields. |
| `clear`      | `function` | Clears all form values. Boolean values will be set to `false`.                                                                                                                                                                                                                   |
| `reset`      | `function` | Resets all form values to defaults. If not default value was given in the fields configuration, the value will be set to the initial value.                                                                                                                                      |
| `select`     | `function` | Selects a field with a `string` key argument and returns a field.                                                                                                                                                                                                                |
| `showErrors` | `function` | Shows/hides errors for all fields failing validation or rather sets the `errorMessage` property of each field to the first validation error if any. Calling `showErrors()` or `showErrors(true)` will display errors while `showErrors(false)` will hide them.                   |
| `extract`    | `function` | A utility function for extracting a particular attribute for all fields. For example `extract('id')` will return the `id` attributes for all fields.                                                                                                                             |

### Example

```javascript
class LoginForm extends React.Component {
    render() {
        const { valid, clear, reset, errors, ... } = this.props.loginForm;
        ...
        return (
            <form>
                ...

                <div>
                    <button disabled={!valid}>Login</button>
                    <button onClick={reset}>Reset</button>
                    <button onClick={clear}>Clear</button>
                </div>
                <ul>
                    {errors.map(err => (<li>{err}</li>))}
                </ul>
            </form>
        )
    }
}

export default connect.loginForm(LoginForm);
```
