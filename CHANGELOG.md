# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/USGS-WiM/StreamStats/tree/dev)

### Added

- Note about Batch Processor output projection

### Changed

- Batch Processor streamgrids retrieved from different endpoints
- Batch Processor times displayed in local time instead of UTC

### Deprecated

### Removed

### Fixed

- Latitude and Longitude columns swapped in the Elevation profile CSV export

### Security

## [v4.18.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.18.1) - 2023-10-27

### Added

- header to available basin characteristics request in the Batch Processor

### Removed

- Text about deleting a batch in the Batch Status tab
- Text about National basin characteristics

### Fixed

- Batch Processor formatting for small screens

## [v4.18.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.18.0) - 2023-10-20

### Added

- Batch Processor
- Batch Processor modal includes "Preview Version" and a warning message

### Changed

- Manage Queue tab now toggled by manageBPQueue boolean variable in appConfig
- USGS logo now includes "science for a changing world"
- Disable BP button on test
- Prediction Interval descriptions and capitalization
- Streamgrid url to hit dev S3 bucket
- Set MRB enableScenarios to false
- Set MO_STL enableScenarios to false

### Fixed

- Updated status map in About modal
- Bugs with BP url parameters

## [v4.17.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.17.0) - 2023-08-30

### Added

- Warning Message Modal that can be toggled via showWarningModal boolean in appConfig.js

### Fixed

- Bug where some gages weren't showing NWIS latitude and longitude on the gage page

## [v4.16.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.16.1) - 2023-07-20

### Changed

- Enabled Wyoming flow statistics
- Simplify to false in the delineation request
- Updated status map

### Fixed

- Added missing parentheses

## [v4.16.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.16.0) - 2023-06-22

### Changed

- Enabled Wyoming region

## [v4.15.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.15.0) - 2023-05-24

### Changed

- Updated national status map (now includes D.C. as undergoing implementation)
- Changed national status map from image URL to downloaded image in images folder
- Open 'Submit a Support Request' tab when users click on 'StreamStats team' link
- Replaced Freshdesk ticket submission with a text to email streamstats@usgs.gov
- Replaced Freshdesk articles with links to StreamStats webpages

### Fixed

- Capitalization of StreamStats

## [v4.14.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.14.1) - 2023-03-29

### Added

- Google analytic tag for querying Propser
- Lat/Long to google analytic tag for edited basin

### Changed

- Enabled edit basin button for all local delineations

## [v4.14.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.14.0) - 2023-03-09

### Changed

- Updated how About modal is filled

### Deprecated

- Basin edit button is now disabled

## [v4.13.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.13.0) - 2023-02-09

### Added

- Enabled scenarios for WI
- Added "Localres" application for DRB

## [v4.12.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.12.0) - 2023-01-11

### Added

- Begin Drainage Area and End Drainage Area attributes to Indiana Coordinated Discharge report
- Ability to download gage pages as a CSV

### Changed

- Moved NC And IA gage pages links inside StreamStats gage page modal
- Watershed symbols in the legend
- StreamStats Gage Page link in gage popups to a button
- Updated to Google Analytics 4
- Updated code.json
- Updated favicon

### Removed

- Legacy NWIS link for gage pages
- NWIS page link in gage popups
- Angulartics

### Fixed

- Bug that shows out of range parameter warning after parameters have been edited to be within range and report is reopened
- Printed gage page now shows all table content instead of cutting of scrolling tables
- Disclaimers on report are now not delimited by commas when downloaded as a CSV
- Spelling error in the Google Analytics (DraingeArea to DrainageArea)

## [v4.11.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.11.1) - 2022-10-14

### Added

- Harper and Andrea to authors in package.json

### Fixed

- Issue where state layers were not showing up

## [v4.11.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.11.0) - 2022-10-14

### Added

- Flow Anywhere Method from StreamEst

### Changed

- Channel Weighting services URL
- NWIS Page link from legacy real-time page to Next Generation Monitoring Location page
- Replaced "NWIS Page" with "Monitoring Location Page"
- FlowAnywhereMapServices to StreamStatsMapServices because IowaStreamEst map services were moved from gis.wim.usgs.gov to gis.streamstats.usgs.gov
- Flow Anywhere application shows published NWIS Drainage Area instead of GIS-calculated drainage area
- SSstormwaterDelineation url in appconfig
- Mystic configuration in appconfig
- DRB configuration in appconfig
- StreamGrid is not visible by default for StormDrain applications

## [v4.10.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.10.1) - 2022-07-20

### Added

- Added Channel-width Methods Weighting results to downloaded CSV

## [v4.10.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.10.0) - 2022-06-16

### Added

- Added loader and disabled download button until longest flow path is downloaded
- Added Maine August Baseflow layer
- QPPQ additions
  - Added line to CSV download that states which Regression Region's results are shown
  - Added collapsible functionality to section in report
  - Added citation to report section

### Changed

- Changed URL for IA and NC supplemental gage pages to new location on S3
- Renamed "New Streamstats Gage Modal" to "Streamstats Gage Modal"
- Shows Longest Flow Path automatically on the main map if returned from the services
- Changes to QPPQ
  - The exceedance probabilities table in report is now sorted from greatest to least exceedance
  - If the "Flow-Duration Curve Transfer Method" scenario is selected, the "Flow-Duration Statistics" scenario button is now selected by default and cannot be unselected while the "Flow-Duration Curve Transfer Method" scenario button is selected.
  - The "Flow-Duration Curve Transfer Method" statistics group does not show up in the Report anymore. Instead, the same information appears in the "Flow-Duration Statistics" statistics group.

### Removed

- Removed "StreamStats Gage page" link

## [v4.9.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.9.0) - 2022-05-19

### Added

- Added ability to collapse report sections
- Added MT equation weighting functionality
- Added ability to switch between QPPQ results if there is more than one result
- Added CHANGELOG.md

### Changed

- Updated Readme
- Separated the ExcludePolys and StreamGrid layers so they can be toggled separately

### Fixed

- Replaced broken marker-creator link in index.html

## [v4.8.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.8.1) - 2022-03-29

## [v4.8.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.8.0) - 2022-03-24

## [v4.7.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.7.0) - 2022-02-17

## [v4.6.2](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.6.2) - 2021-08-10

## [v4.6.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.6.1) - 2021-07-15

## [v4.6.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.6.0) - 2021-07-06

## [v4.5.3](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.5.3) - 2021-05-07

## [v4.5.2](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.5.2) - 2021-04-20

## [v4.5.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.5.1) - 2021-03-29

## [v4.5.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.5.0) - 2021-03-26

## [v4.4.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.4.0) - 2020-08-07

## [v4.3.11](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.3.11) - 2019-11-26

## [v4.3.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.3.1) - 2019-05-29

## [v4.3.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.3.0) - 2018-12-18

## [v4.2.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.2.1) - 2018-05-18

## [v4.2.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.2.0) - 2018-02-20

## [v4.1.6](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.1.6) - 2017-09-15

## [v4.1.5](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.1.5) - 2017-09-14

## [v4.1.4](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.1.4) - 2017-09-08

## [v4.1.3](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.1.3) - 2017-05-01

## [v4.1.2](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.1.2) - 2017-03-15

## [v4.1.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.1.1) - 2017-02-22

## [v4.1.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.1.0) - 2017-02-17

## [v4.0.9](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.9) - 2017-02-16

## [v4.0.8](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.8) - 2016-12-16

## [v4.0.7](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.7) - 2016-12-07

## [v4.0.6](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.6) - 2016-11-08

## [v4.0.5](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.5) - 2016-10-03

## [v4.0.4](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.4) - 2016-03-31

## [v4.0.3](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.3) - 2016-03-22

## [v4.0.2](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.2) - 2016-03-18

## [v4.0.1](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.1) - 2016-03-15

## [v4.0.0](https://github.com/USGS-WiM/StreamStats/releases/tag/v4.0.0) - 2016-02-05
