# Configuration

### Basics

Every form is defined by a [`Config`](../api/Config.md) object. The only required properties are `name` and `fields`. The `name` identifies how the form will be exposed when connecting to components later on and `fields` are the input fields that make up the form.

```javascript
export const loginFormConfig = {
    name: 'loginForm',
    fields: {
        email: {
            rules: 'required|email'
        },
        password: {
            rules: 'required'
        },
        // fields can be initialized with an empty
        // object if they don't need validation and
        // can be set to defaults
        optional: {}
    }
}
```

See the api reference for a complete documentation of available [form](../api/Config.md) and [field](../api/FieldConfig.md) configuration options.

### Nested fields

Sometimes it might be necessary to divide up a form into [different sections](https://axelyung.github.io/yarfl-examples/#/partitioned) or [across pages](https://axelyung.github.io/yarfl-examples/#/wizard/personal-info). In these cases we can create nested fields. Instead of defining field options on the top layer of the `fields` tree we define "parent" fields with their own `fields` property. There is no limit as to how deep nested fields can be defined.

```javascript
export const newUserFormConfig = {
    name: 'newUserForm',
    fields: {
        step1: {
            fields: {
                firsName: {
                    rules: 'required'
                },
                lastName: {
                    rules: 'required'
                }
            }
        },
        step2: {
            fields: {
                email: {
                    rules: 'required'
                },
                telephone: {
                    rules: 'required'
                }
            }
        }
        ...
    }
}
```

### Array fields

Array fields allow the user to [dynamically add new groups of fields](https://axelyung.github.io/yarfl-examples/#/array-fields) in a form. For example, we might want to create several new users at once. To define an array field define a "parent" field as in nested fields, but add `multiple: true`.

```javascript
export const newUsersFormConfig = {
    name: 'newUsersForm',
    fields: {
        users: {
            multiple: true,
            fields: {
                firsName: {
                    rules: 'required'
                },
                lastName: {
                    rules: 'required'
                }
                ...
            }
        },
    },
};
```

### Custom rules

Custom rules are registered on the `customRules` property of a `Config` object. Each rule must contain a `name`, `callback` and `message` property. The `callback` function follows the [`validatorjs` signature](https://github.com/skaterdav85/validatorjs#register-custom-validation-rules).

```javascript
export const newUserFormConfig = {
    name: 'newUserForm',
    fields: {
        ...
        password: {
            type: 'password',
            rules: 'required|not:password',
        },
        ...
    },
    customRules: [{
        name: 'not',
        callback: (value, requirement) => {
            value.toString().toLowerCase() === requirement.toString.toLowerCase(),
        },
        message: "The :attribute cannot be \"password\"",
    }],
};
```

### Async validation

Asynchronous validation rules are registered in the same way but the validation function has a length of four where the last argument (`passes`) is a called when the validation has completed. See an example [here](https://axelyung.github.io/yarfl-examples/#/async).

```javascript
export const newUserFormConfig = {
    name: 'newUserForm',
    fields: {
        ...
        username: {
            rules: 'required|username',
        },
        ...
    },
    customRules: [{
        name: 'username',
        callback: (value, _req, _attr, passes) => {
            fetch(`http://example.com/username-taken?username=${value}`)
                .then(usernameTaken => {
                    if(usernameTaken) {
                        passes(false, `The username '${value}' is not available!`);
                    } else {
                        passes();
                    }
                })
                .catch(err => {
                    console.error('Error checking username:\n', err);
                    passes(false, `Error checking availability of username!`);
                })
        },
    }],
};
```

### Getters/setters

In some cases it might be helpful to have a way of [transforming the field's value](https://axelyung.github.io/yarfl-examples/#/getters-setters) between reading from and writing to the store. Each field can be configured with optional `getter` and `setter` properties to achieve just that.

In the following example the user writes/reads a base 10 number, but a binary string value is persisted to the store. When reading from the store, this binary string is converted back into a base 10 number.

```javascript
export const newUserFormConfig = {
    name: 'newUserForm',
    fields: {
        ...
        age: {
            ...
            setter: value => parseInt(value).toString(2),
            getter: (value) => {
                const result = parseInt(value, 2);
                return Number.isNaN(result) ? '' : result;
            },
        },
        ...
    },
};
```
