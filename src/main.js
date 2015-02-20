(function (global, factory) {
  /* global module, define */

  "use strict";

  var i18n = factory();

  if(typeof(module) === "object" && typeof(module.exports) === "object") {
    module.exports = i18n;
  } else if(typeof(define) === "function") {
    define([], i18n);
  } else {
    global.i18n = i18n;
  }
}(this, function () {
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
      Translations = (function() {
        var scope = "_scope";

        function Translations(language, o) {
          this.language = language;
          this[scope] = o;
        }

        Translations.prototype.find = function(path) {
          return path.split(".").reduce(function (obj, key) {
            return obj ? obj[key] : undefined;
          }, this[scope]);
        };

        Translations.prototype.translate = function(ele) {
          if(getLang(ele) === this.language) {
            if(!ele.hasAttribute("data-i18n")) {
              [].slice.call(ele.querySelectorAll("[lang]:not([lang='" + this.language + "'])")).forEach(this.translate, this);
            }
          } else if(ele.hasAttribute("data-i18n")) {
            applyTranslationToElement(ele, this);
          } else {
            [].slice.call(ele.querySelectorAll("[data-i18n]")).map(function(match) {
              if(getLang(match, ele) !== this.language) {
                applyTranslationToElement(match, this);
              }
            }, this);
          }

          return ele;
        };

        return Translations;
      }()),
      Formats = (function() {
        var scope = "_scope";

        function Formats(language, o) {
          this.language = language;
          this[scope] = o;
        }

        return Formats;
      }()),
      debug = (function() {
        var debug = {
          enabled: false
        };

        ["info", "warn", "error"].forEach(function(name) {
          debug[name] = function() {
            if(this.enabled) {
              console[name].apply(console, arguments);
            }
          };
        });

        return debug;
      }()),
      i18n;

  function applyTranslationToElement(ele, obj) {
    if(ele.hasAttribute("data-i18n")) {
      applyTranslation(ele, ele.getAttribute("data-i18n"), obj);
    }
  }

  function applyTranslation(ele, path, obj) {
    var translated = obj.find(path);

    if (typeof(translated) === "object" && !Array.isArray(translated)) {
      debug.warn("Could not translate %o: path '%s' is of type object", ele, path);
    } else if(typeof(translated) !== "undefined") {
      clean(ele);
      ele.appendChild(toDom(translated));
      ele.lang = language;
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
    return document.createTextNode(content);
  }

  i18n = {
    base: (document.documentElement.getAttribute("data-i18n-base") || "locales/"),
    set: (document.documentElement.getAttribute("data-i18n-set") || "translation"),
    loadTranslations: function(lang, set, base) {
      var url;
      base = base || this.base || "";
      lang = lang || language;
      set = set || this.set;
      url = base + lang + "/" + set + ".json";

      debug.info("loading translations for %s from: %s", lang, url);

      return fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      }).then(function (res) {
        if (res.status >= 200 && res.status < 300) {
          debug.info("successfully loaded translations for %s", lang);

          return res.json().then(function(obj) {
            return new Translations(lang || language, obj);
          });
        }

        // TODO add error object instead of false
        return Promise.reject(false);
      }).catch(function (err) {
        debug.error("Error loading translations for %s: %o", lang, err);
        return Promise.reject(err);
      });
    },

    translate: function(ele) {
      if(!this.translations) {
        this.translations = this.loadTranslations();
      }

      return this.translations.then(function(translations) {
        return translations.translate(ele);
      });
    },
    translateAll: function() {
      this.translatedAll = true;
      return this.translate(document.documentElement);
    },
    get: function(path) {
      if(!this.translations) {
        this.translations = this.loadTranslations();
      }

      return this.translations.then(function(obj) {
        return obj.find(path);
      });
    },

    formatBase: (document.documentElement.getAttribute("data-i18n-format-base") || "formats/"),
    loadFormats: function(lang, base) {
      var url;
      base = base || this.formatBase || "";
      lang = lang || language;
      url = base + lang + ".json";

      return fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      }).then(function (res) {
        if (res.status >= 200 && res.status < 300) {
          debug.info("successfully loaded translations for %s", lang);

          return res.json().then(function(obj) {
            return new Formats(lang || language, obj);
          });
        }

        // TODO add error object instead of false
        return Promise.reject(false);
      }).catch(function (err) {
        debug.error("Error loading translations for %s: %o", lang, err);
        return Promise.reject(err);
      });
    },

    set language(lang) {
      lang = String(lang);

      if(lang !== language) {
        language = lang;

        if(this.translations) {
          this.translations = this.loadTranslations();
        }
        if(this.translatedAll) {
          this.translateAll(lang);
        }
      }
    },
    get language() {
      return language;
    },

    get debug() {
      return debug.enabled;
    },
    set debug(val) {
      debug.enabled = Boolean(val);
    }
  };

  if(!document.documentElement.hasAttribute("data-i18n-disable-auto")) {
    i18n.translateAll();
  }

  return i18n;
}));
