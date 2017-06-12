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

**Deployment**

```javascript
$ gulp deploy
```

## Environment Control

From any template use the ``{{#if}}`` condition to control output for post compile.There's also an object in Node for [process.env](https://nodejs.org/api/process.html#process_process_env). You can set the environment via the command line like so…

```shell
export NODE_ENV=production
```
```shell
export NODE_ENV=development
```
