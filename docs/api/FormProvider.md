# `FormProvider`

The `FormProvider` component is an alternative to `connect` that accesses the store via a [render prop](https://reactjs.org/docs/render-props.html). Like `connect`, `FormProvider` will pass all forms as individual props, but in most cases only a single form is necessary. `FormProvider` has individual component properties for each form so that a component only needs to register to changes of one form. See the example below.

### Props

| Name     |    Type    | Description                                                  |
|----------|:----------:|--------------------------------------------------------------|
| `render` | `function` | A [render prop](https://reactjs.org/docs/render-props.html) accepting one or more forms as props. |

### Example

`FormProvider` can be used to render multiple forms...

```javascript
import { FormProvider } from './store';

class MultipleForms extends React.Component {
    render() {
        return (
            <FormProvider render={({ loginForm, newUserForm, ... }) => {
                    ...
                }}
            />
        )
    }
}
```

...or just one:

```javascript
import { FormProvider } from './store';

class LoginForm extends React.Component {
    render() {
        return (
            <FormProvider.loginForm render={({ loginForm }) => {
                    ...
                }}
            />
        )
    }
}
```
