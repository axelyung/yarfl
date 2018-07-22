# Configuration

### Basics

Every form is defined by a `Config` object. The only required properties are `name` and `fields`. The `name` identifies how the form will be exposed when connecting to components later on and `fields` are the input fields that make up the form.

```javascript
export const loginFormConfig = {
    name: 'loginForm',
    fields: {
        email: {
            rules: 'required|email'
        },
        password: {
            rules: 'required'
        }
    }
}
```

See the api reference for a complete documentation of available form and field configuration options.

### Nested fields

Sometimes it might be necessary to divide up a form into different sections or across pages. In these cases we can create nested fields. Instead of defining field options on the top layer of the `fields` tree we define "parent" fields with their own `fields` property. There is no limit as to how deep nested fields can be defined.

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

Array fields allow the user to dynamically add new groups of fields in a form. For example, we might want to create several new users at once. To define an array field define a "parent" field but add `multiple: true`.

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

Custom rules are registered on the `customRules` property of a `Config` object. Each rule must contain a `name`, `callback` and `message` property. The `callback` function follows the [`validatorjs` signature](https://github.com/skaterdav85/validatorjs#register-custom-validation-rules)

```javascript
export const newUserFormConfig = {
    name: 'newUserForm',
    fields: {
        ...
        password: {
            type: 'password',
            rules: 'required|pwCheck',
        },
        ...
    },
    customRules: [{
        name: 'pwCheck',
        callback: value => value.toString().toLowerCase() === 'password',
        message: "The password cannot be \"password\"",
    }],
};
```

### Async validation

Asynchronous validation rules are registered in the same way but the callback has

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

(todo)
