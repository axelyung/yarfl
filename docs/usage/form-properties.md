# Using `Form` props

After connecting a component to the store via `connect` or `FormProvider`, it will receive either one or all of the initialized forms as props depending on whether the named or generic alternative was used.

The form prop(s) is named after the `name` property specified in the form's configuration and contains properties exposing the state of the form as well as a handful of methods for dispatching actions to the store, extracting specific attributes and selecting fields. See the [`Form` API reference](../api/Form.md) for complete documentation of included properties.

```javascript
import React from 'react';
import { connect } from './store';

class LoginForm extends React.Component {
    render() {
        const { loginForm } = this.props;
        // the form property exposed both the state of the form
        // as well as methods for interacting with the store
        const { values, valid, errors, select, ...} = loginForm;
        return (
            ...
        )
    }
}

export default connect.loginForm(LoginForm);
```

### `select`

The `select` function is used to pick out individual fields to read, update or bind to input components. `select` accepts a key in the form of a period-separated string and returns an object with the field's state, dispatch methods and a `bind` function. See the [`select` API reference](../api/select.md) for details of the different properties.

```javascript
import React from 'react';
import { connect } from './store';

class LoginForm extends React.Component {
    render() {
        const { select } = this.props.loginForm;
        const email = select('email');
        return (
            <form>
                <div>
                    <label htmlFor={email.id}>
                        {email.errorMessage || email.label}
                    </label>
                    <input {...email.bind()}/>
                </div>
                ...
            </form>
        )
    }
}

export default connect.loginForm(LoginForm);
```

**NOTE:** For [nested forms](./configuration.md#nested-fields) the key is written as a period-separated string (i.e `'step1.firstName'`) following the form schema specified in its configuration. With [array fields](./configuration.md#nested-fields) the index is written in brackets (i.e `'users[1]'`). Yarfl throws an error if you try and select a field with an invalid key.
