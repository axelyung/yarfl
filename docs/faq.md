
# FAQ

#### How do I create more than one form?

The `init` function accepts as many `config` objects as necessary:

```javascript
import { init } from 'yarfl';
import { loginFormConfig, paymentFormConfig, ... } from './configs'

const { reducer, initialState, connect } = init(loginFormConfig, paymentFormConfig, ...);
```

#### How do I connect a component to only one `yarfl` form?

By default the `connect` HOC will track all the registered forms, but `connect` as a property for each form (same as the `name` for each config) so that React components don't have to listen to everything.

```javascript
// store.js
import { init } from 'yarfl';
import { loginFormConfig, paymentFormConfig, ... } from './configs'

// forms are configured with names 'loginForm' and 'paymentForm'
const { reducer, initialState, connect } = init(loginFormConfig, paymentFormConfig, ...);
```

```javascript
// LoginForm.js
import React from 'react';
import { connect } from './store.js';

class LoginForm extends React.Component {
...
}

export default connect.loginForm(MyComponent)
```

```javascript
// PaymentForm.js
import React from 'react';
import { connect } from './store.js';

class PaymentForm extends React.Component {
...
}

export default connect.paymentForm(MyComponent)
```

In the example above, each component only receives the form prop that they're interested in tracking, while a component registered with the default `connect` would receive both form props. The same principle applies when using `FormProvider`. `FormProvider` by itself will track all forms where as `FormProvider.loginForm` will only track `loginForm`.
