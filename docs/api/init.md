# `init(config1[, config2[, ...[, configN]]])`

The init function accepts one or more `Config` objects a arguments and returns assets necessary to create the store and connect React components to listen to and dispatch changes.

### Arguments

| Name      | Type     | Description                          |
|-----------|:--------:|--------------------------------------|
| `configN` | `Config` | A `Config` object defining the form. |

### Returns

An object with the following properties:

| Name           |    Type    | Description                                                                                                  |
|----------------|:----------:|--------------------------------------------------------------------------------------------------------------|
| `reducer`      | `function` | A reducer function to pass as the first argument in `createStore` or to be implemented in `combineReducers`. |
| `initialState` |  `object`  | The initial form state as the second argument in `createStore` or to be combined with other initial states.  |
| `connect`      | `function` | A HOC to connect React components to the store via props.                                                    |
| `FormProvider` | `function` | A React component that exposes state and dispatching via a render prop.                                      |

### Example 

```javascript
import { init } from 'yarfl';
import { createStore } from 'redux';
import { loginFormConfig, newUserConfig, ... } from './configs';

const {
    reducer,
    initialState,
    connect,
    FormProvider
} = init(loginFormConfig, newUserConfig, ...);

const store = createStore(reducer, initialState);

export { connect, FormProvider, store };
```