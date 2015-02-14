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
      Translations = (function() {
        var scope = "_scope";

        function Translations(o) {
          this[scope] = o;
        }

        Translations.prototype.find = function(path) {
          return path.split(".").reduce(function (obj, key) {
            return obj ? obj[key] : undefined;
          }, this[scope]);
        };

        Translations.prototype.translate = function(ele) {
          if(getLang(ele) === languageDialect) {
            if(!ele.hasAttribute("data-i18n")) {
              [].slice.call(ele.querySelectorAll("[lang]:not([lang='" + language + "'])")).forEach(this.translate.bind(this));
            }
          } else if(ele.hasAttribute("data-i18n")) {
            applyTranslationToElement(ele, this);
          } else {
            [].slice.call(ele.querySelectorAll("[data-i18n]")).map(function(match) {
              if(getLang(match, ele) !== languageDialect) {
                applyTranslationToElement(match, this);
              }
            });
          }

          return ele;
        };

        return Translations;
      }());

  function applyTranslationToElement(ele, obj) {
    if(ele.hasAttribute("data-i18n")) {
      applyTranslation(ele, ele.getAttribute("data-i18n"), obj);
    }
  }

  function applyTranslation(ele, path, obj) {
    var translated = obj.find(path);

    if (typeof(translated) === "object" && !Array.isArray(translated)) {
      console.warn("Could not translate %o: path '%s' is of type object", ele, path);
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

  global.i18n = {
    base: (document.documentElement.getAttribute("data-i18n-base") || "locales/"),
    set: (document.documentElement.getAttribute("data-i18n-set") || "translation"),
    loadTranslations: function(lang, set, base) {
      var url = (base || this.base || "") + (lang || language) + "/" + (set || this.set) + ".json";
      console.info("loading translations from: " + url);

      return fetch(url, {
        headers: {
          "Accept": "application/json"
        }
      }).then(function (res) {
        if (res.status >= 200 && res.status < 300) {
          console.info("successfully loaded translations");

          return res.json().then(function(obj) {
            return new Translations(obj);
          });
        }

        // TODO add error object instead of false
        return Promise.reject(false);
      }).catch(function (err) {
        console.error("Error loading translations: %o", err);
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
    set language(lang) {
      lang = String(lang);

      if(lang !== language) {
        language = lang;

        if(this.translatedAll) {
          this.translateAll(lang);
        } else if(this.translations) {
          this.translations = this.loadTranslations();
        }
      }
    },
    get language() {
      return language;
    }
  };

  if(!document.documentElement.hasAttribute("data-i18n-disable-auto")) {
    global.i18n.translateAll();
  }
}(this));
