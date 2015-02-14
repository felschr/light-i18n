(function (global) {
  "use strict";

  var languageDialect = (function(lang) {
  		window.location.search.slice(1).split("&").some(function (searchTerm) {
  			if (searchTerm.indexOf("lang=") === 0) {
  				lang = searchTerm.split("=").slice(1).join("=");
  				return true;
  			}
  		});

  		return lang.toLowerCase();
  	})(window.navigator.userLanguage || window.navigator.language),
    language = languageDialect.split("-")[0],
    translations;

  function loadTranslations(language, set, base) {
    var url = (base || "locales/") + language + "/" + (set || "translation") + ".json";
    console.info("loading translations from: " + url);

    return fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    }).then(function (res) {
      if (res.status >= 200 && res.status < 300) {
        console.info("successfully loaded translations");
        return res.json();
      }

      // TODO add error object instead of false
      return Promise.reject(false);
    }).catch(function (err) {
      console.error("Error loading translations: %o", err);
    });
  }

  function loadAndApplyTranslations(language, ancestor, set, base) {
    return loadTranslations(language, set, base).then(function (obj) {
      translate(obj, ancestor);
      return obj;
    });
  }

  function applyTranslationToElement(ele, obj) {
    if(ele.hasAttribute("i18n")) {
      applyTranslation(ele, ele.getAttribute("i18n"), obj);
    }
  }

  function applyTranslation(ele, path, obj) {
		var translated = getByPath(obj, path);

    if (typeof(translated) === "undefined") {
      console.warn("Could not translate %o: path '%s' not found", ele, path);
    } else if (typeof(translated) === "object" && !Array.isArray(translated)) {
      console.warn("Could not translate %o: path '%s' is of type object", ele, path);
    } else {
      clean(ele);
			ele.appendChild(toDom(translated));
    }
  }

  function getLang(ele, threshold) {
    do {
      if(ele.lang) {
        return ele.lang.toLowerCase();
      }
    } while((ele = ele.parentElement) && ele !== threshold);
  }

  function clean(ele) {
    var child;
    while((child = ele.firstChild)) {
      ele.removeChild(child);
    }
  }

  function toDom(content) {
    if(Array.isArray(content)) {
      return content.reduce(function(frag, text) {
        var ele = document.createElement("p");
        ele.textContent = text;
        frag.appendChild(ele);

        return frag;
      }, document.createDocumentFragment());
    }
    return new Text(content);
  }

  function getByPath(obj, path) {
    return path.split(".").reduce(function (obj, key) {
      return obj ? obj[key] : undefined;
    }, obj);
  }

  function translate(obj, ancestor) {
    ancestor = ancestor || document.documentElement;

    if(getLang(ancestor) === languageDialect) {
      if(!ancestor.hasAttribute("i18n")) {
        [].slice.call(ancestor.querySelectorAll("[lang]:not([lang='" + language + "'])")).forEach(translate.bind(null, obj));
      }
      return;
    }

    if(ancestor.hasAttribute("i18n")) {
      applyTranslationToElement(ancestor, obj);
    } else {
      [].slice.call(ancestor.querySelectorAll("[i18n]")).forEach(function(ele) {
        if(getLang(ele, ancestor) !== languageDialect) {
          applyTranslationToElement(ele, obj);
        }
      });
    }
  }

  translations = loadAndApplyTranslations(language);

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
        translations = loadAndApplyTranslations(lang);
			}
    },
    get language() {
      return language;
    }
  };
}(this));
