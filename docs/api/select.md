# `select(key)`

The `select` function accepts a key `string` corresponding to a field in the form.

### Arguments

| Name  |   Type   | Description                                     |
|-------|:--------:|-------------------------------------------------|
| `key` | `string` | A `string` corresponding to a field in the form |

### Returns

An object with all the fields properties (extends `ConfigField`). plus the following:

| Property     |    Type    | Description                                                                                                                                              |
|--------------|:----------:|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `valid`        |  `boolean` | Whether the field passes all validation rules.                                                                                                           |
| `errors`       |   `array`  | An array of all the error messages for the field if failing validation.                                                                                  |
| `errorCount`   |  `number`  | The total number of validation errors (equal to the length of `errors`).                                                                                 |
| `errorMessage` |  'string'  | The first error in `errors` if `showErrors = true`.                                                                                                      |
| `set`          | `function` | Sets the field's value, for example `set('John Doe')`.                                                                                                                                  |
| `clear`        | `function` | Clears the field's value.                                                                                                                                |
| `reset`        | `function` | Resets the field's value to `default`. If no `default` was given the field is set to its initial value.                                                  |
| `showErrors`   | `function` | Sets `showErrors = true` for the field, or `showErrors(false)` will set `showErrors = false`                                                                                                                 |
| `bind`         | `function` | "Binds" the field to an HTML input component with properties corresponding to HTML attributes and event handlers for `onChange`, `onFocus` and `onBlur`. |

### Example

```javascript
class LoginForm extends React.Component {
    render() {
        const { select } = this.props.loginForm;
        const email = select('email');
        const password = select('password');
        return (
            <form>
                <div>
                    <label htmlFor={email.id}>
                        {email.errorMessage || email.label}
                    </label>
                    <input {...email.bind()}/>
                </div>
                <div>
                    <label htmlFor={password.id}>
                        {password.errorMessage || password.label}
                    </label>
                    <input {...password.bind()}/>
                </div>
                <div>
                    <button>Login</button>
                </div>
            </form>
        )
    }
}

export default connect.loginForm(LoginForm);
```
