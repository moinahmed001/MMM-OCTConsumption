/* Magic Mirror
 * Module: MMM-OCTConsumption
 *
 * By Mykle1
 *
 */
Module.register("MMM-OCTConsumption", {

    // Module config defaults.
    defaults: {
        useHeader: true, // false if you don't want a header
        header: "Electricity Cost", // Any text you want
        animationSpeed: 3000, // fade in and out speed
        initialLoadDelay: 4250,
        updateInterval: 3 * 60 * 60 * 1000,
    },

    getStyles: function() {
        return ["MMM-OCTConsumption.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.url = "http://moinahmed.ddns.net:5000/api/octopus/agile/consumption/daily";
        this.OCTConsumption = [];
        this.activeItem = 0;         // <-- starts rotation at item 0 (see Rotation below)
        this.scheduleUpdate();       // <-- When the module updates (see below)
    },

    getDom: function() {

		// creating the wrapper
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";

		// The loading sequence
        if (!this.loaded) {
            wrapper.innerHTML = "Elec cost appearing ..!";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

		// creating the header
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light", "header", "fa-bolt");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var shape = document.createElement("div");
        shape.classList.add("xsmall", "bright", "shape", "left-text");
        shape.innerHTML = "Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Cost";
        wrapper.appendChild(shape);

        var Keys = Object.keys(this.OCTConsumption);
        for (i=0; i<Keys.length; i++){
            if (this.OCTConsumption[i].date != undefined && this.OCTConsumption[i].cost != undefined){
                var tariff = document.createElement("div");
                if (this.OCTConsumption[i].cost < 0.22){
                    tariff.classList.add("bright", "xsmall", "left-text");
                } else if (this.OCTConsumption[i].cost > 0.21 && this.OCTConsumption[i].cost < 1){
                    tariff.classList.add("success", "xsmall", "left-text");
                } else if (this.OCTConsumption[i].cost > 0.9 && this.OCTConsumption[i].cost < 2){
                    tariff.classList.add("warning", "xsmall", "left-text");
                } else {
                    tariff.classList.add("danger", "xsmall", "left-text");
                }
                tariff.innerHTML = this.OCTConsumption[i].date + " &nbsp;&nbsp;&nbsp; &pound;" + this.OCTConsumption[i].cost.toFixed(2) + " &nbsp;&nbsp;&nbsp;&nbsp;|| &nbsp;&nbsp;&nbsp;&nbsp;";
                var row = document.createElement("span");
                row.classList.add("right-text");
                row.innerHTML = this.OCTConsumption[i].kwH.toFixed(2) + " kWh " + " &nbsp;&nbsp;&nbsp;&nbsp;|| &nbsp;&nbsp;&nbsp;&nbsp;&pound;" + this.OCTConsumption[i].average.toFixed(2) + " average"
                tariff.appendChild(row)
                wrapper.appendChild(tariff);
            } else {
                console.log(">>>>>> ERROR: index " + i);
            }
        }

        return wrapper;

    }, // <-- closes the getDom function from above

	// this processes your data
    processOCTConsumption: function(data) {
        this.OCTConsumption = data;
       // console.log(this.OCTConsumption); // uncomment to see if you're getting data (in dev console)
        this.loaded = true;
    },


// this tells module when to update
    scheduleUpdate: function() {
        setInterval(() => {
            this.getOCTConsumption();
        }, this.config.updateInterval);
        this.getOCTConsumption(this.config.initialLoadDelay);
        var self = this;
    },


	// this asks node_helper for data
    getOCTConsumption: function() {
        this.sendSocketNotification('GET_OCTConsumption', this.url);
    },


	// this gets data from node_helper
    socketNotificationReceived: function(notification, payload) {
        if (notification === "OCTConsumption_RESULT") {
            this.processOCTConsumption(payload);
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
