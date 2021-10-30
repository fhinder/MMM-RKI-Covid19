/* Magic Mirror
 * Node Helper: RKI-Covid19
 * 
 * By Fabian Hinder
*/

var NodeHelper = require("node_helper")
var request = require("native-request");

const BASE_URL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?";

module.exports = NodeHelper.create({
	// Override start.
	start: function () { },

	/** Override socekt notification handler
	 * @param {string} notification
	 * @param {object} payload, containing configuration
	*/
	socketNotificationReceived: function (notification, payload) {
		switch (notification) {
			case "GET_RKI_DATA":
				var self = this;
				self.getRKIData(payload);
				break;
		}
	},

	/** Define getRKIData function
	 * Returns data from API call
	 * @param {object} configuration, containing counties
	*/
	getRKIData: function (payload) {
		var self = this;
		var url = BASE_URL + 'where=';
		var counties = payload.config.counties;
		var states = payload.config.states;
		if (counties.length == 0 && states.length == 0) {
			url = url + '1%3D1';
		} else {
			for (i = 0; i < counties.length; i++) {
				if (i != 0) url = url + ' OR ';
				url = url + 'county = \'' + counties[i] + '\'';
			}
			for (i = 0; i < states.length; i++) {
				if (i != 0) url = url + ' OR ';
				if (i == 0 && counties.length != 0) url = url + ' OR ';
				url = url + 'BL = \'' + states[i] + '\'';
			}
		}
		url = url +
			'&outFields=BL,county,last_update,cases7_per_100k,cases7_bl_per_100k&outSR=4326&' +
			'f=json';
		var options = {
			'method': 'GET',
			'url': encodeURI(url),
			'headers': {
			}
		};

		request.request(options, function (error, response) {
			if (error) {
				throw new Error(error);
				self.sendSocketNotification("RKI_DATA_ERROR", error);
			} else {
				var dataAll = (JSON.parse(response)).features;
				var result = [];
				for (let i = 0; i < states.length; i++) {
					for (let j = 0; j < dataAll.length; j++) {
						if (states[i] == dataAll[j].attributes.BL) {
							result.push({
								'county': states[i],
								'cases7_per_100k': dataAll[j].attributes.cases7_bl_per_100k,
								'last_update': self.parseDate(dataAll[j].attributes.last_update)
							});
							break;
						}
					}
				}
				for (let i = 0; i < counties.length; i++) {
					for (let j = 0; j < dataAll.length; j++) {
						if (counties[i] == dataAll[j].attributes.county) {
							result.push({
								'county': counties[i],
								'cases7_per_100k': dataAll[j].attributes.cases7_per_100k,
								'last_update': self.parseDate(dataAll[j].attributes.last_update)
							});
							break;
						}
					}
				}
				self.sendSocketNotification("RKI_DATA", result);
			}
		}); 
	},

	parseDate: function (dateToParse) {
		var dateArray = dateToParse.split(",");
		//Länge ==2
		try {
			if (dateArray.length == 2) {
				var timeOfDay = dateArray[1].split(" ");
				var hoursMinutes = timeOfDay[1].split(":");
				if (hoursMinutes.length == 2) {
					var hours = hoursMinutes[0];
					var minutes = hoursMinutes[1];
				} else {
					throw new Error();
				}
				dateArray = dateArray[0].split(".");
				if (dateArray.length == 3) {
					var day = dateArray[0];
					var month = dateArray[1];
					var year = dateArray[2];
				} else {
					throw new Error();
				}
				return new Date(year, month-1, day, hours, minutes);

			} else {
				throw new Error();
			}
		} catch (err) {
			console.log("Error in parsing date");
			return dateToParse;
		}
		
	}


});
