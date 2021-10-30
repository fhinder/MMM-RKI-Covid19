# MMM-RKI-Covid19
A [MagicMirror²](https://magicmirror.builders/) module for RKI-Covid19 Data

![Example](screenshot.jpg)

## Dependencies
This module depends on the following API:<br>
https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/917fc37a709542548cc3be077a786c17_0 <br>
The API can be used without any registration

## Installation

Go to your MAcigMirror's module folder:
```
cd ~/MagicMirror/modules
```
Clone this repository:
````
git clone https://github.com/fhinder/MMM-RKI-Covid19.git
````
Execute npm install in the module’s directory:
````
cd MMM-RKI-Covid19
npm install
````
Add the module to the modules list in  your config file:

````javascript
{
	module: "MMM-RKI-Covid19",
	position: "top_right",
	header: "RKI-Data",
	config:{
		reloadInterval: 60*60*1000,
		showUpdateTimestampInHeader: false,
		tableClass: "small",
		counties: [		
			'SK Köln',
			'SK Berlin Mitte',
			'SK München' 
		],
		states: [
			'Nordrhein-Westfalen',
			'Berlin',
			'Baden-Würtemberg'
		]
	}
},
````
## Configuration

|option         | description|
|---------------|------------|
|reloadInterval | Reload Interval in ms <br> <b>Possible values</b>: <code>number</code> <br> <b>Default value</b>: 3600000 |
|showUpdateTimestampInHeader | Boolean to switch "last update time" in header on or off. If the last update is older than 24hours, the last update time is shown independent of this switch to indicate outdated data. <br> <b>Possible values</b>: <code> true, false <code/> <b>Default value</b>: true |
|tableClass	| Table configuration <br>. Check the general MagicMirror css file for possible values. <b>Default value</b>: "small" |
|counties	| Array of counties to be displayed. List of counties can be found in the API manual (check dependencies). <br> <b>Possible values</b>: <code>array of string</code> <br> <b>Default value</b>: ['SK Köln', 'SK Berlin Mitte', 'SK München'] |
|states	| Array of states to be displayed. List of states can be found in the API manaual (check dependencies). <br> <b>Possible values</b>: <code>array of string</code> <br> <b>Default value</b>: ['Nordrhein-Westfalen', 'Berlin', 'Baden-Würtemberg'] |



## Development Status
The module is in WIP, but the basic functionality is available.
