# streamstats

> Basin delineation and flow statistics computation application

## Project setup

##### required software
[node.js](http://nodejs.org)  
[git](https://git-scm.com/)  
[typescript 1.7] (https://github.com/Microsoft/TypeScript)

#### 1.  Install global dependencies
This will install the following packages globally

```bash
npm install -g bower
npm install -g gulp
npm install -g typings
```

#### 2.  Update/add packages
This will install the required dependencies to the project

Inside of your project folder (after git fork and clone):
```bash
npm install
bower install
typings install 
```
[upgrade from tsd to typings] (https://github.com/DefinitelyTyped/tsd/issues/269)

------

## Building a release


##### Step 1.
Bump the version.  Run only one of the below commands.  
This creates a local commit with the package.json, bower.json and tsd.json updated to the new version number

```
gulp patch     # makes v0.1.0 → v0.1.1
gulp feature   # makes v0.1.1 → v0.2.0
gulp release   # makes v0.2.1 → v1.0.0
```

##### Step 2.   
 Push the commit that contains the json files with bumped versions to your personal github repo 
 
```
git push origin master
```

##### Step 3.   
 Create and merge pull request with version incremented (github.com)

##### Step 4.  
Get latest version from upstream (all this should be is a commit for the pull request in Step 3.) 

```
git pull USGS-WiM master
```

##### Step 5.   
Run "gulp push" to push the commit with the release tags up to the upstream (WiM) repository.

```
gulp push
```