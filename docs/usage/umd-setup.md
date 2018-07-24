# UMD Setup

The library is accessible via a `Yarfl` global when distributed in UMD format.

```html
<html lang="en">
    <head>
        <meta charset="utf-8">
        <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/redux/dist/redux.js"></script>
        <script src="https://unpkg.com/react-redux/dist/react-redux.js"></script>
        <script src="https://unpkg.com/redux-thunk/dist/redux-thunk.js"></script>
        <!-- minified version available at https://unpkg.com/yarfl/dist/yarfl.min.js -->
        <script src="https://unpkg.com/yarfl/dist/yarfl.js"></script>

        <title>Yarfl with UMD setup</title>
    </head>
    <body>
    ...
    <script>
        var config = {
            ...
        }

        var initResult = Yarfl.init(config);
        var reducer = initResult.reducer;
        var initialState = initResult.initialState;

        var enhancer = Redux.applyMiddleware(ReduxThunk.default);

        var store = Redux.createStore(reducer, initialState, enhancer);
        ...
    </script>
```
