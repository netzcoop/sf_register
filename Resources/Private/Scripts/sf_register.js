/* global define, XMLHttpRequest */
(function(factory) {
	if ('function' === typeof define && define.amd) {
		define('map', [], factory);
	} else {
		factory();
	}
})(function() {
	var document = window.document,
		module = {},

		loading = false,
		zone,
		zoneEmpty,
		zoneLoading,
		ajaxRequest;

	/**
	 * @param {string} id
	 *
	 * @returns {Object}
	 */
	module.getElement = function (id) {
		return 'object' === typeof id ? id : document.getElementById(id);
	};

	/**
	 * @param {Object} element
	 */
	module.showElement = function (element) {
		element.style.display = 'block';
	};

	/**
	 * @param {Object} element
	 */
	module.hideElement = function (element) {
		element.style.display = 'none';
	};

	/**
	 * Attach an event to an element
	 *
	 * @param {string|Object} id
	 * @param {string} eventName
	 * @param {callback} callback
	 */
	module.attachToElement = function (id, eventName, callback) {
		var element = module.getElement(id);

		if (element && element.addEventListener) {
			element.addEventListener(eventName, callback, false);
		} else if (element) {
			element.attachEvent('on' + eventName, callback);
		}
	};


	/**
	 * Gets bargraph element and calls test password function
	 * with value entered in field where this callback is attached
	 */
	module.callTestPassword = function () {
		var bargraph = module.getElement('bargraph'),

			// calculating percent score for sprite
			meter = window.testPassword(this.value),
			percentScore = Math.min(
				(Math.floor(meter.intScore / 3.4) * 10),
				100
			) / 10,

			// displaying the sprite
			count = 0,
			blinds = (bargraph.contentDocument || bargraph.contentWindow.document).getElementsByClassName('blind');

		for (var blindKey in blinds) {
			if (blinds.hasOwnProperty(blindKey)) {
				if (count < percentScore) {
					module.hideElement(blinds[blindKey]);
				} else {
					module.showElement(blinds[blindKey]);
				}
				count++;
			}
		}
	};


	/**
	 * Change value of zone selectbox
	 *
	 * @param {event} event
	 */
	module.changeZone = function (event) {
		if (
			(
				(
					event.type === 'keyup' &&
					(event.keyCode === 40 || event.keyCode === 38)
				) ||
				event.type === 'change'
			) &&
			loading !== true
		) {
			if (zone) {
				loading = true;
				var target = event.target || event.srcElement;
				var countrySelectedValue = target.options[target.selectedIndex].value;

				zone.length = 0;
				module.hideElement(zone);

				module.hideElement(zoneEmpty);
				module.showElement(zoneLoading);

				ajaxRequest = new XMLHttpRequest();
				ajaxRequest.onreadystatechange = module.xhrReadyStateChanged;
				ajaxRequest.open('POST', 'index.php?eID=sf_register');
				ajaxRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				ajaxRequest.send('tx_sfregister[action]=zones&tx_sfregister[parent]=' + countrySelectedValue);
			}
		}
	};

	/**
	 * Process ajax response and display error message or
	 * hand data received to add zone option function
	 */
	module.xhrReadyStateChanged = function (stateChanged) {
		var xhrResponse = stateChanged.target;

		if (xhrResponse.readyState === 4 && xhrResponse.status === 200) {
			var xhrResponseData = JSON.parse(xhrResponse.responseText);
			module.hideElement(zoneLoading);

			if (xhrResponseData.status === 'error' || xhrResponseData.data.length === 0) {
				module.showElement(zoneEmpty);
			} else {
				module.addZoneOptions(xhrResponseData.data);
			}
		}

		loading = false;
	};

	/**
	 * Process data received with xhr response
	 *
	 * @param {[]} options
	 */
	module.addZoneOptions = function (options) {
		zone.options = [];

		options.forEach(function (option, index) {
			zone.options[index] = {
				test: option.label,
				value: option.value,
			};
		});

		module.showElement(zone);
	};

	/**
	 * Adds a preview information about file to upload in a label
	 */
	module.uploadFile = function () {
		document.getElementById('uploadFile').value = this.value;
	};

	/**
	 * Selects the form and triggers submit
	 */
	module.submitForm = function () {
		module.getElement('sfrForm').submit();
	};

	/**
	 * Attach content loaded element with callback to document
	 */
	function initialize() {
		module.attachToElement(document, 'DOMContentLoaded', function () {
			var barGraph = module.getElement('bargraph');
			zone = module.getElement('sfrZone');
			zoneEmpty = module.getElement('sfrZone_empty');
			zoneLoading = module.getElement('sfrZone_loading');

			if (barGraph !== null) {
				barGraph.classList.add('show');
			}

			module.attachToElement('sfrpassword', 'keyup', module.callTestPassword);
			module.attachToElement('sfrCountry', 'change', module.changeZone);
			module.attachToElement('sfrCountry', 'keyup', module.changeZone);
			module.attachToElement('uploadButton', 'change', module.uploadFile);
		});
	}
	initialize();

	/**
	 * Register global function to be accessible from outside of the module
	 */
	window.sfRegister_submitForm = function () {
		module.submitForm();
	};
});
