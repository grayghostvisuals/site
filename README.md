![Gray Ghost Visuals](https://dl.dropboxusercontent.com/u/41114960/github/ggv/site.png)

## Project Overview

 - Templates : Assemble
 - Styles : Sass
 - Task Manager : Gulp
 - Pkg Mgr: NPM & Bower

## Installation

```javascript
$ npm install && bower install
```

## Gulp Tasks

**Local Development**

```javascript
$ gulp
```

**Production Build**

```javascript
$ gulp build
```

**Clean Environment**

```javascript
$ gulp clean
```

**Preview Build**

```javascript
$ gulp preview
```

**Deployment**

```javascript
$ gulp deploy
```

## Environment Control

Environmental controls are governed by an option found within ``gulpfile.js``.

```javascript
assemble.option('production', <true | false>);
```

```html
{{#if production}}
<script src="script.min.js"></script>
{{else}}
<script src="script.js"></script>
{{/if}}
```

From any template use the ``{{#if}}`` condition to control output for post compile.There's also an object in Node for [process.env](https://nodejs.org/api/process.html#process_process_env).

```javascript
assemble.option('env', process.env);
```

You can set it at the command line by doing something like…

```shell
BUILD_ENV=production
```

and then testing using the ``{{#is}}`` helper in Assemble from within your templates

```html
{{#is env.BUILD_ENV 'production'}}
<p>Production Env</p>
{{/is}}
```

## Assemble Documentation

This is a custom build of the Assemble project using some fancy whiz bangs. There are a couple ways to pull in categories on a template.

**Option #1**
```html
{{> clients}}
```