/* light-i18n main */
/* jshint browser: true */
// Base function.
(function (global) {
  "use strict";

  var language = (function(lang) {
  		window.location.search.slice(1).split("&").some(function (searchTerm) {
  			if (searchTerm.indexOf("lang=") === 0) {
  				lang = searchTerm.split("=").slice(1).join("=");
  				return true;
  			}
  		});

  		return lang.toLowerCase().split("-")[0];
  	})(window.navigator.userLanguage || window.navigator.language),
    translations;

  function loadTranslations(language, set, base) {
    var url = (base || "locales/") + language + "/" + (set || "translation") + ".json";
    console.info("loading translations from: " + url);

    return fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "UTF-8"
      }
    }).then(function (res) {
      if (res.ok) {
        return res.json();
      }

      // TODO add error object instead of false
      return Promise.reject(false);
    }).then(function (obj) {
      console.log("successfully loaded translations");

      translate(obj);
      return obj;
    }).catch(function (err) {
      console.error("Error loading translations: %o", err);
    });
  }

  function applyTranslationToElement(ele, obj) {
    if(ele.hasAttribute("i18n")) {
      applyTranslation(ele, ele.getAttribute("i18n"), obj);
    }
  }

  function applyTranslation(ele, path, obj) {
		var translated = getByPath(obj, path);

    if (typeof(translated) !== "undefined") {
			ele.textContent = translated;
    } else {
      console.log("Could not translate website: path '%s' not found", path);
    }
  }

  function getByPath(obj, path) {
    return path.split(".").reduce(function (obj, key) {
      return obj ? obj[key] : undefined;
    }, obj);
  }

  function translate(obj, parent) {
    parent = parent || document;

    if(parent.hasAttribute("i18n")) {
      applyTranslationToElement(parent, obj);
    }

    [].slice.call((parent || document).querySelectorAll("[i18n]")).forEach(function(ele) {
      applyTranslationToElement(ele, obj);
    });
  }

  translations = loadTranslations(language);

  global.i18n = {
    translations: translations,
    translate: function(ele) {
      return this.translations.then(function(obj) {
        translate(obj, ele);
        return obj;
      });
    },
    set language(lang) {
			lang = String(lang);

			if(lang !== language) {
      	language = lang;
        translations = loadTranslations(lang);
			}
    },
    get language() {
      return language;
    }
  };
}(this));
