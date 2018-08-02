# YARFL

##### Yet Another Redux Forms Library

##### Manage form state in React/Redux applications with reactive updates and field level validation. Heavily inspired by [MobX React Form](https://github.com/foxhound87/mobx-react-form)

[![npm](https://img.shields.io/npm/v/yarfl.svg)]()
[![Build Status](https://travis-ci.org/axelyung/yarfl.svg?branch=master)](https://travis-ci.org/axelyung/yarfl)
[![node](https://img.shields.io/node/v/yarfl.svg)]()
[![GitHub license](https://img.shields.io/github/license/axelyung/yarfl.svg)]()
[![Downloads](https://img.shields.io/npm/dt/yarfl.svg)]()
[![Downloads](https://img.shields.io/npm/dm/yarfl.svg)]()

[![NPM](https://nodei.co/npm/yarfl.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/yarfl/)

## Warning: experimental, not ready for production

## Features

- Easy and JSON-serializable configuration.
- Reactive updates with input binding.
- Reactive validation with error messages.
- Supports both sync and async validation.
- Array fields.
- Nested fields.
- Easily integrated with component libraries (Material Ui, React Widgets, React Select, etc).
- Adheres to functional and immutable design principles.
- Written in Typescript.

## Getting started

See the [getting started](https://axelyung.github.io/yarfl/getting-started.html) section of the documentation.

## Demo

There is a working live demo of this library's implementation [here](https://axelyung.github.io/yarfl-examples) with accompanying [source code](https://github.com/axelyung/yarfl-examples).

## Why?

Neither [Redux Form](https://github.com/erikras/redux-form) nor [React Redux Form](https://github.com/davidkpiano/react-redux-form) (the two most popular React/Redux form libraries) provide an easy way of creating serializable form configurations. Furthermore, both libraries require the use of their own form and/or input components leading to unnecessary complexity. This library attempts to solve the first issue by dynamically creating a reducer function from serializable configurations and the second by exposing an API that does not *require* the need for special React components. The benefit is that more of the forms' functionality can be abstracted to the configuration rather than having to create individual form/field components.
