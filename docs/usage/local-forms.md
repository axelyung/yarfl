# Local forms without Redux

In some cases we may have forms that don't need to be persisted to the store (in some cases even preferable as discussed [here](https://github.com/reduxjs/redux/issues/1287#issuecomment-175351978). The `LocalForm` component provides a way of using Yarfl's API without having to initialized the form in Redux. `LocalForm` stores and updates data in its own React state and renders the form via a render prop.

```javascript
import React from 'react';
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
