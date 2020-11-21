/* Magic Mirror
 * Node Helper: RKI-Covid19
 * 
 * By Fabian Hinder
*/

var NodeHelper = require("node_helper")
var request = require("request");

const BASE_URL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?";

module.exports = NodeHelper.create({
	// Override start.
	start: function() {},
	
	/** Override socekt notification handler
	 * @param {string} notification
	 * @param {object} payload, containing configuration
	*/
	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
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
	getRKIData: function(payload) {
		var self = this;
		var url = BASE_URL + 'where=';
		var counties = payload.config.counties;
		if(counties.length==0){
			url = url + '1%3D1';
		}else{
			for(i=0;i<counties.length;i++){
				if(i!=0) url = url + ' OR ';
				url = url + 'county = \'' + counties[i] + '\'';
			}
		}
		url = url + 
			'&outFields=county,last_update,cases7_per_100k&outSR=4326&' +
			'f=json';
		var options = {
			'method': 'GET',
			'url': encodeURI(url),
			'headers': {
			}
		};	
		
		request(options, function (error, response) {
			if (error){
				throw new Error(error);
				self.sendSocketNotification("RKI_DATA_ERROR", error);
			}else{
				self.sendSocketNotification("RKI_DATA", (JSON.parse(response.body)).features);
			}
		}); 
	}
});