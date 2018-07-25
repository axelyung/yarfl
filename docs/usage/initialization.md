# Initialization

After creating one or more [`Config`](../api/Config.md) objects, use [`init`](../api/init.md) to generate what you need to create a Redux store and connect React components.

```javascript
import { init } from 'yarfl';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { loginFormConfig, newUserConfig, ... } from './configs'

// pass one or more config objects to init
const { reducer, initialState, connect } = init(loginFormConfig, newUserConfig, ...);

// redux-thunk is a peer dependency of yarfl
const enhancers = applyMiddleware(thunk)

// create the store as you normally would
const store = createStore(reducer, initialState, enhancers);

// You'll want to export connect (or FormProvider) with
// the store in order to connect React components
export { store, connect }
```

### With `combineReducers`

It's entirely possible to combine the Yarfl reducer with other reducers for more complicated Redux applications, but each config must be defined with a `mapState` selector function so that Yarfl knows where to look for the form state.

```javascript
// configs.js
export const loginFormConfig = {
    name: 'loginForm',
    // all exported form configs will need a corresponding
    // mapState selector function in this example
    mapState: state => state.forms.loginForm,
    fields: {
        ...
    }
}
```

```javascript
// store.js
import { init } from 'yarfl';
import { createStore, combineReducers, ... } from 'redux';
import thunk from 'redux-thunk';
import { loginFormConfig, ... } from './configs'

const forms = init(loginFormConfig, ...);

const reducer = combineReducers({
    forms: forms.reducer,
    ...
})

const initialState = {
    forms: forms.initialState,
}

// and continue creating the store as in the previous example...
```
