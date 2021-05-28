/* Magic Mirror
 * Module: RKI-Covid19
 *
 * By Fabian Hinder
 * Data based on NPGEO Corona data / RKI / RKI Corona Landkreise
 * API description: https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/917fc37a709542548cc3be077a786c17_0/
*/

Module.register("MMM-RKI-Covid19", {
	// Default module config
	defaults: {
		reloadInterval: 60*60*1000, //once per hour
		tableClass: "small",
		showUpdateTimestampInHeader: true,
		showUpdateTimestampInFooter: false,
		counties: [
			'SK Köln',
			'SK Berlin Mitte',
			'SK München'
		],
		states: [
			'Nordrhein-Westfalen',
			'Berlin',
			'Baden-Württemberg'
		]
	},
	
	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);
		this.dataRKI = [];
		this.loaded = false;
	},
	
	// Override dom generator.
	getDom: function (){
		const wrapper = document.createElement("div");
		
		if(!this.loaded){
			wrapper.innerHTML = "Lade ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		if(this.dataRKI.length==0){
			wrapper.innerHTML = "Ups something went wrong";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		var table = document.createElement("table");
		table.className = this.config.tableClass;
		
		var data = ['Region', 'Inzidenz'];
		var thead = table.createTHead();
		var row = thead.insertRow();
		for (var key of data) {
			var th = document.createElement("th");
			var txt = document.createTextNode(key);
			th.appendChild(txt);
			row.appendChild(th);
		}
		
		for (let i = 0; i < this.dataRKI.length; i++){
			var d = this.dataRKI[i];
			var row = document.createElement("tr");
			table.appendChild(row);
			
			var countyCell = document.createElement("td");
			countyCell.className = "county";
			countyCell.innerHTML = d.county;
			row.appendChild(countyCell);
			
			var c7_100kCell = document.createElement("td");
			c7_100kCell.className = "cases7_per_100k";
			c7_100kCell.innerHTML = Math.round(d.cases7_per_100k);
			row.appendChild(c7_100kCell);
			
			if(i==0) this.dataRKI.lastUpdate = d.last_update;
		}
		wrapper.appendChild(table);
		
		if(this.dataRKI.lastUpdate){
			let updateInfo = document.createElement("div");
			updateInfo.className = "xsmall light align-right";
			let dateNow = new Date;
			let dateUpdate = new Date(this.dataRKI.lastUpdate);
			let delta = Math.abs(dateNow - dateUpdate) / (1000 * 60 * 60);
			if (delta >= 24) {
				updateInfo.innerHTML = "Last update is older than 24 hours: " + dateUpdate.toLocaleDateString();
			} else {
				if(this.config.showUpdateTimestampInFooter) {
					updateInfo.innerHTML = "Update: " + dateUpdate.toLocaleDateString();
				}
			}
			wrapper.appendChild(updateInfo);
		}
		
		return wrapper;
	},
	
	// Override getHeader method.
	getHeader: function () {
		if (this.config.showUpdateTimestampInHeader == false) {
			return this.data.header;
		}else {
			if (this.dataRKI.lastUpdate) {
				var dateUpdate = new Date(this.dataRKI.lastUpdate);
				if (this.data.header) return this.data.header + " updated on " + dateUpdate.toLocaleDateString();
				return "updated on " + dateUpdate.toLocaleDateString();
			}
			return this.data.header;
		}
	},
	
	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		switch(notification) {
			case "DOM_OBJECTS_CREATED":
				//Update the data, after creating
				this.sendSocketNotification("GET_RKI_DATA", 
					{
						"config": this.config,
						"identifier": this.identifier
					}
				)
				//Start timer for update
				var timer = setInterval( ()=> {
					this.sendSocketNotification("GET_RKI_DATA", 
						{
							"config": this.config,
							"identifier": this.identifier
						}
					)
				}, this.config.reloadInterval);
				break;
		}
	},
	
	// Override socket notification handler
	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case "RKI_DATA":
				this.dataRKI = payload;
				this.dataRKI.lastUpdate = "";
				this.loaded = true;
				this.updateDom();
				break;
			case "RKI_DATA_ERROR":
				this.dataRKI = [];
				//ToDo Error Handling to user
				break;
		}
	}
}
)

