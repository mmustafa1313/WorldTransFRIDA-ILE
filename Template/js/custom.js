(function() {
	let service;
	let originalRestoreFxn;

	let varsToKeep = {
		"Interface.Set STA Target Value": null,
		"Interface.Set STA Target Year": null,
		"Interface.Set GDPpp Target Value": null,
		"Interface.Set GDPpp Target Year": null,
		"Interface.Set Inequality Target Value": null,
		"Interface.Set Inequality Target Year": null
	};

	function setVarsToKeep() {
		service.startTransaction();
		for (const variable in varsToKeep) {
			let value = varsToKeep[variable];
			if (value || value === 0)
				service.controlEntity(variable, value);
		}
		service.executeTransaction();
	}

	document.addEventListener('DOMContentLoaded', function() {
		service = document.getElementById('service');

		let sim = window["Sim"];
		originalRestoreFxn = sim.restore.bind(sim);

		sim.restore = function(kind, callback) {
			if (kind === "all_outputs") 
				return originalRestoreFxn(kind, callback);


			let newCb = function(result) {
				setVarsToKeep();
				callback(result);
			};

			return originalRestoreFxn(kind, newCb); // after the restore, reset all of the saved values
		};

		//anytime a controller changes,  check the current values of the variables we care about
		service.addEventListener('controllers-changed', function(e) {
			service.startTransaction();
			for (const variable in varsToKeep) {
				service.getValue(variable, "current", "controller", function(result) {
					varsToKeep[variable] = result.value;
				});
			}
			service.executeTransaction();
		});
	});
}());