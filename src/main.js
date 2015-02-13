/* light-i18n main */
/* jshint browser: true */

// Base function.
var i18n = (function(global) {
	"use strict";
	var language = window.navigator.userLanguage || window.navigator.language,
			searchTerms = window.location.search.substring(1).split(/[?&]/);

	function loadTranslations(language) {
		var url = window.location.protocol + "//" + window.location.host + window.location.pathname + "locales/" + language + "/translation.json",
				xhr;

		console.log("loading translations from: " + url);
		xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Accept-Encoding", "UTF-8");
		
		// TODO add event listeners for error cases
		xhr.onreadystatechange = function() {
			var translationJson;

			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					try {
						console.log("successfully loaded translations");
						translationJson = JSON.parse(xhr.responseText);
					} catch (e) {
						console.error("could not parse JSON translations", e);
					}

					if (translationJson) {
						searchForTranslationElements(translationJson);
					}

				} else {
					console.log("failed loading translations");
				}
			}
		};
		xhr.send();
	}

	function getTranslation(key, json) {
		var nodes = key.split("."),
				translation = json;

		nodes.forEach(function(node) {
			translation = translation[node];
		});

		return translation;
	}

	function applyTranslation(ele, key, json) {
		if (json !== null) {
			ele.innerHTML = getTranslation(key, json);
		} else {
			console.log("Could not translate website because JSON wasn't loaded yet.");
		}
	}

	function searchForTranslationElements(translationJson) {
		var translationElements = document.querySelectorAll("[i18n]");

		[].forEach.call(translationElements, function(ele) {
			applyTranslation(ele, ele.getAttribute("i18n"), translationJson);
		});
	}

	searchTerms.some(function(searchTerm) {
		if (searchTerm.indexOf("lang=") === 0) {
			language = searchTerm.split("=")[1];
			return true;
		}
	});

	language = language.split("-")[0];
	loadTranslations(language.toLowerCase());

	return true;
})(self);

