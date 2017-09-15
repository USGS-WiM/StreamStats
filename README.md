# streamstats

> Basin delineation and flow statistics computation application
## Disclaimer
This software has been approved for release by the U.S. Geological Survey (USGS). Although the software has been subjected to rigorous review, the USGS reserves the right to update the software as needed pursuant to further analysis and review. No warranty, expressed or implied, is made by the USGS or the U.S. Government as to the functionality of the software and related material nor shall the fact of release constitute any such warranty. Furthermore, the software is released on condition that neither the USGS nor the U.S. Government shall be held liable for any damages resulting from its authorized or unauthorized use.

## Project setup

##### required software
[node.js](http://nodejs.org)  
[git](https://git-scm.com/)  
[typescript 1.7] (https://github.com/Microsoft/TypeScript)

#### 1.  Install global dependencies
This will install the following packages globally

```bash
npm install -g gulp
npm install -g typings
```

#### 2.  Update/add packages
This will install the required dependencies to the project

Inside of your project folder (after git fork and clone):
```bash
npm install
typings install 
```

------

## Building a release

**Commit, Sync, and Merge Pull Request on any current project changes.  The steps below require a clean git status.**

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
git add .
git commit -m "bump version"
git push origin staging
```

##### Step 3.   
 Create and merge pull request to master with version incremented (github.com)

##### Step 4.  
Create new release on github.com
