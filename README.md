# YARFL: Yet Another Redux Forms Library

A [Redux](http://redux.js.org/) validation library for [React]() that does not require the user to use any special React components.

## Documentation

https://axel-yung.gitbook.io/redux-validated/

## Quick start

1. Install (`redux`, `react` and `react-redux` are peer dependencies)

    ```bash
    yarn add redux react react-redux redux-validated
    ```

2. Define a `config` object with a `fields` property describing what fields should be part of the Redux state and how they should be validated. The `rules` string describes which rules from [validatorjs](https://github.com/skaterdav85/validatorjs#available-rules) the field should be validated against.

    ```javascript
    const config = {
        name: 'myForm',
        fields: {
            name: {
                rules: 'required'
            },
            email: {
                rules: 'required|email'
            },
            age: {
                rules: 'required|min:18'
            }
        }
    }
    ```

3. Create a reducer, initial state and a connector by passing the `config` object to the `init` function and then simply create the Redux store as you normally would:

    ```javascript
    import { init } from 'redux-validated';
    import { createStore } from 'redux';

    const { reducer, initState, connect } = init(config);

    const store = createStore(reducer, initState);
    ```

4. To connect a React component with the store from the previous step use the `connect` method that we created with `init` in step three. (NOTE: this `connect` method doesn't require `mapStateToProps` or `mapDispatchToProps` arguments. This is taken care of by Redux Validated automatically). Set up the store `Provider` as you normally would with `react-redux`:

    ```jsx
    // redux.js
    import { init } from 'redux-validated';
    import { createStore } from 'redux';

    const { reducer, initState, connect } = init(config);

    const store = createStore(reducer, initState);

    export { connect, store };

    // App.js
    import React from 'react';
    import { Provider } from 'react-redux';
    import { store } from './redux.js'
    import MyFormComponent from './MyFormComponent.js';

    class App extends React.Component {
        render() {
            return (
                <Provider store={store}>
                    <MyFormComponent />
                </Provider>
            )
        }
    }

    // MyFormComponent.js
    import React from 'react';
    import { connect } from './redux.js';

    class MyFormComponent extends React.Component {
    ...
    }

    export default connect(MyComponent)
    ```

5. By default `ownProps` and a form prop of the name specified in the config object (in our case `myForm`) are passed to the "connected" component. The `myForm` prop is an object containing a handful of properties and methods to interact with the validated Redux store.

    ```jsx
    class MyComponent extends React.Component {

        render () {
            const { select, valid, errors } = this.props.myForm
            /**
            * The 'select' function returns an object containing
            * the 'name' field object from state with a 'bind'
            * function.
            */
            const nameField = select('name');
            return (
                <form>
                    <div>
                        {/*
                            The 'bind' function returns an object of properties
                            that can be spread on an input element effectively
                            binding that component to update and track the state.
                        */}
                        <label>{nameField.label}</label><br/>
                        <input {...nameField.bind()} />
                    </div>
                    {/*
                        The 'valid' property describes if all fields
                        registered in the Redux store pass their
                        validation rules.
                    */}
                    <button type="submit" disabled={!valid} />
                    <div>
                        {/*
                            The 'errors' array contain the first error
                            message (if any) for all registered fields.
                        */}
                        <label>All errors:</label>
                        <ul>
                            {errors.map(err => <li>{err}</li>)}
                        </ul>
                    </div>
                </form>
            )
        }
    }
    ```

    The `bind` method returns an object containing input props including `value` with the field value from the state and `onChange`, `onBlur` and `onFocus` handlers which dispatch actions to update state.

    ```javascript
    const bindProps = select('name').bind();

    /*
    bindProps = {
        value: '',
        default: '',
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Name',
        className: '',
        placeholder: 'Name',
        disabled: false,
        autoFocus: false,
        onChange: (e: InputEvent, value?: any) => void,
        onBlur: () => void,
        onFocus: () => void,
    }
    */
    ```

    Using the spread syntax will attach all the props to the input element, but you are free to choose which properties you want to use or create new ones from `bind`'s return values:

    ```jsx
    render() {
        const { select } = this.props;
        const { id, value, onChange } = select('email').bind();
        return (
            ...
            <input {...select('name').bind()} />
            ...
            <input
                id={`${id}-is-the-id`}
                name="custom-email-name"
                value={value}
                onChange={(e, value) => {
                    console.log('About to dispatch...')
                    onChange(e);
                    console.log('Dispatch complete!')
                }}
            />
            ...
        )
    }
    ```

6. To initiate more than one form just add more config objects as input parameters from the `init` function from step three.

    ```javascript
    import { init } from 'redux-validated';
    import { createStore } from 'redux';

    const { reducer, initState, connect } = init(config1, config2, config3);

    const store = createStore(reducer, initState);
    ```