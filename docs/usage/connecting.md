# Connecting to React

Once you've created the store you'll have to make it available to the application via the [`Provider`](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#provider-store) component included in the React Redux API. Yarfl includes two ways of connecting components to the store: [`connect`](#with-connect) or [`FormProvider`](#with-formprovider).

### With `connect`

Yarfl's version of [`connect`](../api/connect.md) works the same way as that of ReactRedux except `mapStateToProps` and `mapDispatchToProps` is already taken care of so you only need to pass the target React component. The `connect` HOC returned by `init` also has a named HOC property for every form initialized. The store is exposed in a [`Form`](../api/Form.md) prop with the same name in the form's configuration.

```javascript
import React from 'react';
import { connect } from './store';

class LoginForm extends React.Component {
    render() {
        const { loginForm } = this.props;
        return (
            ...
        )
    }
}

// This assumes that there exists a form
// config where name = 'loginForm'
export default connect.loginForm(LoginForm);
```

**NOTE:** In the above example you could export `connect(LoginForm)` without using the named `loginForm` property, but then the `LoginForm` will listen to state changes from all of the initialized forms. In most cases it's recommended that you use the named property as it will minimize unnecessary re-renders.

### With `FormProvider`

Another alternative is to use render props via the [`FormProvider`](../api/FormProvider.md) component returned by `init`. `FormProvider`'s render prop (`render`) receives the same `Form` prop that is passed by `connect` in the previous section. Like `connect`, `FormProvider` has a named component property for each form.

```javascript
import React from 'react';
import { FormProvider } from './store';

export default class LoginForm extends React.Component {
    render() {
        return (
            <FormProvider.loginForm render={({ loginForm }) => (
                <form>
                    ...
                </form>
            )} />
        )
    }
}
```
