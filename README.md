![WiM](wimlogo.png)

# StreamStats

StreamStats client application

### Prerequisites

##### required software
[node.js](http://nodejs.org)  
[git](https://git-scm.com/)  

Install global dependencies
```bash
npm install -g typescript
npm install -g gulp
npm install -g typings
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Clone the repository (https://help.github.com/articles/cloning-a-repository/)

```bash
git clone https://github.com/USGS-WiM/StreamStats
```

Inside of your project folder (after clone):
```bash
npm install
typings install 
npm install -g concurrently
npm install -g live-server
```

For Freshdesk functionalities (used in the About and Help modals), you will need the secrets.json from [here](https://doimspp.sharepoint.com/sites/StreamStatsTeam/Shared%20Documents/Forms/AllItems.aspx?viewid=9f283fd0%2D4904%2D450b%2D80ce%2Da5211e70406e&id=%2Fsites%2FStreamStatsTeam%2FShared%20Documents%2FSS%5FTeamSpace%2FV4%20Freshdesk%20Creds). This requires access to the StreamStats Sharepoint, and should be placed locally at src/data.

Note: the secrets file is in the .gitignore and should _never_ be uploaded to GitHub 

## Building and testing

Serve files with hot module replacement (live reload)
```
npm start
```

To build a production version of the app:
```
npm run-script build
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests to us. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on adhering by the [USGS Code of Scientific Conduct](https://www2.usgs.gov/fsp/fsp_code_of_scientific_conduct.asp).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](../../tags). 

**Commit, Sync, and Merge Pull Request on any current project changes.  The steps below require a clean git status.**

**Make sure you have the latest dependencies by running `npm install`**

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
 
```bash
git add .
git commit -m "bump version"
```

##### Step 3.   
 Create pull request with version incremented (github.com)

##### Step 4.  
Create new release on github.com

To push tags to remote origin: `git push origin --tags`

*Note that your alias for the remote origin may differ.

## Authors


* **[Katrin Jacobsen](https://www.usgs.gov/staff-profiles/katrin-jacobsen)**  - *Developer* - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)
* **[Jeremy Newson](https://www.usgs.gov/staff-profiles/jeremy-k-newson)**  - *Developer* - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)
* **[Marty Smith](https://www.usgs.gov/staff-profiles/martyn-smith)**  - *Developer* - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)
* **[Tara Gross](https://www.usgs.gov/staff-profiles/tara-a-gross)**  - *Developer* - [USGS Colorado Water Science Center](https://www.usgs.gov/centers/co-water)
* **[Andrea Medenblik](https://www.usgs.gov/staff-profiles/andrea-s-medenblik)**  - *Co-Lead Developer* - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)
* **[Harper Wavra](https://www.usgs.gov/staff-profiles/harper-wavra)**  - *Co-Lead Developer* - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)

See also the list of [contributors](../../graphs/contributors) who participated in this project.

## License

This project is licensed under the Creative Commons CC0 1.0 Universal License - see the [LICENSE.md](LICENSE.md) file for details

## Suggested Citation

In the spirit of open source, please cite any re-use of the source code stored in this repository. Below is the suggested citation:

`This project contains code produced by the Web Informatics and Mapping (WIM) team at the United States Geological Survey (USGS). As a work of the United States Government, this project is in the public domain within the United States. https://wim.usgs.gov`


## About WIM

* This project authored by the [USGS WIM team](https://wim.usgs.gov)
* WIM is a team of developers and technologists who build and manage tools, software, web services, and databases to support USGS science and other federal government cooperators.
* WiM is a part of the [Upper Midwest Water Science Center](https://www.usgs.gov/centers/wisconsin-water-science-center).
