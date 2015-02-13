/* light-i18n main */
/* jshint browser: true */

// Base function.
var i18n = (function(global) {
	"use strict";
	var language = window.navigator.userLanguage || window.navigator.language,
			searchTerms = window.location.search.slice(1).split("&");

	function loadTranslations(language) {
		var url = window.location.protocol + "//" + window.location.host + window.location.pathname + "locales/" + language + "/translation.json",
				xhr;

		console.info("loading translations from: " + url);
		return fetch(url, {
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "UTF-8"
            }
        }).then(function(res) {
            if(res.ok) {
                return res.json();
            }
            // TODO add error object instead of false
            return Promise.reject(false);
        }).then(function(obj) {
			console.log("successfully loaded translations");
			return searchForTranslationElements(obj);
		}).catch(function(err) {
            console.error("Error loading translations: %o", err);
        });
	}

	function applyTranslation(ele, key, obj) {
		if (obj) {
			ele.innerHTML = getByPath(obj, key);
		} else {
			console.log("Could not translate website because JSON wasn't loaded yet.");
		}
	}

    function getByPath(obj, path) {
        return path.split(".").reduce(function(obj, key) {
            return obj ? obj[key] : undefined;
        }, obj);
    }

	function searchForTranslationElements(translationJson, parent) {
		var translationElements = (parent || document).querySelectorAll("[i18n]");

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

