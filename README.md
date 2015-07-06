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

## Environment Control

Environmental controls are governed by an option found within ``gulpfile.js``.

```javascript
assemble.option('production', 'false');
```

From any template use the ``{{#if}}`` condition to control output for post compile. For example if we set the argument to false and used the following if condition to control what script block is served…

```html
{{#if production}}
<script src="script.min.js"></script>
{{else}}
<script src="script.js"></script>
{{/if}}
```

That would result in the following generated output.

```html
<script src="script.js"></script>
```