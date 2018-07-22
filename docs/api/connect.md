# `connect(component)`

The `connect` function returned by `init` is a React HOC. It accepts a React component as its only argument and returns a new component connected to the forms store via a prop matching the name(s) of the registered form(s). This implements the same strategy as `react-redux`'s own `connect` function except in this case `mapStateToProps` and `mapDispatchToProps` is already taken care of so `connect` is passed the component directly.

```javascript
// react-redux
connect(mapStateToProps, mapDispatchToProps)(MyFormComponent);

// yarfl
connect(MyFormComponent);
```

Make sure you are using the right `connect` when connecting components! You might want to export the Yarfl version as `yarflConnect` to avoid confusion.

By default `connect` will pass all forms as individual props, but in most cases a component is only concerned with a single form. `connect` has individual function properties for each form so that a component only needs to register to changes of one form. For example if a form was configured with `name: 'loginForm'`, `LoginForm` would only receive a `loginForm` prop even if multiple forms were registered.

```javascript
// LoginForm.js
class LoginForm extends React.Component {
    render() {
        const { loginForm } = this.props;
        ...
    }
}

connect.loginForm(LoginForm);
```

### Arguments

| Name        |     Type    | Description                                |
|-------------|:-----------:|--------------------------------------------|
| `component` | `Component` | A React component to connect to the store. |

### Returns

A new connected component class.

### Example

```javascript
// store.js
import { init } from 'yarfl';
import { createStore } from 'redux';
import { loginFormConfig, newUserConfig } from './configs';

const {
    reducer,
    initialState,
    connect,
    FormProvider
} = init(loginFormConfig, newUserConfig);

export { connect as yarflConnect };
```

```javascript
// LoginForm.js
import React from 'react';
import { yarflConnect } from './store';

class LoginForm extends React.Component {
    ...
}

export default yarflConnect.loginForm(LoginForm); // loginFormConfig.name = 'loginForm'
```

```javascript
// NewUserForm.js
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { yarflConnect } from './store';

class NewUserForm extends React.Component {
    ...
}

/**
 * There's nothing to prevent you from using both the ReactRedux and
 * Yarfl version of connect. The `compose` function included in the
 * Redux API is handy for composing HOCs!
 */
const normalHOC = connect(state => ({ loadingNewUser: state.loading.newUser }));
const yarflHOC = yarflConnect.newUserForm; // newUserConfig.name = 'newUserForm'
const combinedHOC = compose(normalHOC, yarflHOC);

export default combinedHOC(NewUserForm);
```