# `LocalForm`

The `LocalForm` component initializes and creates the form in its own state rather than in Redux. This is an alternative for forms that don't need to have their state persisted globally and doesn't require any Redux dependencies.

### Props

| Name     |    Type    | Description                                                       |
|----------|:----------:|-------------------------------------------------------------------|
| `config` |  `Config`  | A [`Config`](./Config.md) object defining the form.                              |
| `render` | `function` | A render prop accepting the a `Form` object as its only property. |

### Example

`LocalForm` works similarly to `FormProvider` with `render` but a `config` prop is also required.

```javascript
import { LocalForm } from 'yarfl';
import { loginFormConfig } from './configs';

class LoginForm extends React.Component {
    render() {
        return (
            <LocalForm config={loginFormConfig} render={(loginForm) => {
                const { select } = loginForm;
                const email = select('email');
                const password = select('password');
                return (
                    <form>
                        <div>
                            <label htmlFor={email.id}>
                                {email.errorMessage || email.label}
                            </label>
                            <input {...email.bind()} />
                        </div>
                        <div>
                            <label htmlFor={password.id}>
                                {password.errorMessage || password.label}
                            </label>
                            <input {...password.bind()} />
                        </div>
                        <div>
                            <button>Login</button>
                        </div>
                    </form>
                )}}
            />
        )
    }
}
```
