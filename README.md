# streamstats

> This is the pre-alpha version of StreamStats v4.  It is an angular that is styled with bootstrap and uses leaflet as its mapping API

> Build environment: Visual Studio 2013 with TypeScript


## Project setup

#### 1.  Install required software (see Getting Started above before proceeding)
[node.js](http://nodejs.org)  
[github for windows](https://windows.github.com/) (only required if GUI is preferred, otherwise can use command line)  

#### 2.  Install global dependencies
This will install the following packages globally

```bash
npm install -g bower
npm install -g gulp
npm install -g tsd
```

#### 3.  Update/add packages
This will install the required dependencies to the project

Inside of your project folder (after git fork and clone)
```bash
npm install
bower install
tsd install
```

## Building a release

#### 1.  Create distribution build
This will concatenate and minify all css and js files, trim and clean project and copy to "/dist"

```bash
gulp
```

Optionally to view distribution build in a lightweight webserver use:
```bash
gulp watch
```

#### 2.  Create release build
This will copy "/dist" to "/release", tag with a github release tag with version number

```bash
gulp release [ver]
```