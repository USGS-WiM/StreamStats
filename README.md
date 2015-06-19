# streamstats

> alpha version of StreamStats v4.  Mapping application using angular, leaflet, bootstrap

## Project setup

##### required software
[node.js](http://nodejs.org)  
[github for windows](https://windows.github.com/)   
[cmder](http://gooseberrycreative.com/cmder/)   

#### 1.  Install global dependencies
This will install the following packages globally

```bash
npm install -g bower
npm install -g gulp
npm install -g tsd
```

#### 2.  Update/add packages
This will install the required dependencies to the project

Inside of your project folder (after git fork and clone):
```bash
npm install
bower install
tsd install
```

------

## Building a release

#### 1.  Create test build
This will concatenate and minify all css and js files, trim and clean project and copy to "/dist"

```bash
gulp
```

Optionally to view distribution build in a lightweight webserver use:
```bash
gulp watch
```

#### 2.  Create release build
Bumps version number and tagging the repository with it.   
Please read http://semver.org/

You can use the commands
 ```bash
gulp patch     # makes v0.1.0 → v0.1.1
OR
gulp feature   # makes v0.1.1 → v0.2.0
OR
gulp release   # makes v0.2.1 → v1.0.0
 ```

To run, use the appropriate versioning text above, then use "gulp push" to push the commit with the release tags up to the repository

```bash
gulp push
```