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
      Localisations = (function() {
        var scope = "_scope";

        function Localisations(language, o) {
          this.language = language;
          this[scope] = o;
        }

        Localisations.prototype.localise = function(node, type) {
          var isEle = node.nodeType === Node.ELEMENT_NODE,
            attr = ["DATA", "META"].indexOf(node.tagName) === -1 ? "value" : (isEle && node.hasAttribute("data-i18n-original")) ? "data-i18n-original" : undefined,
            val = attr ? node.getAttribute(attr) : node.nodeValue;

          if(!attr && isEle) {
            node.setAttribute("data-i18n-original", val);
          }

          if(!type && isEle) {
            type = node.getAttribute("data-localise-as");
          }

          if(!type) {
            throw new Error("Localisations.prototype.localise: missing type");
          }

          switch(type) {
            case "number":
              val = this.localiseNumber(val);
              break;

            default:
              throw new Error("Localisations.prototype.localise: missing type");
          }

          node.nodeValue = val;
        };

        Localisations.prototype.localiseNumber = function(number) {
          var separator = [this.number.thousands, this.number.thousandths];

          return parseFloat(number).toString().split(".").map(function(part, i) {
            var chrs = part.split(""),
              length = chrs.length,
              ret = [],
              i2;

            if(!i) {
              chrs.reverse();
            }

            for(i2 = 0; i2 < length; i2 += 3) {
              ret.push(chrs[i2], chrs[i2 + 1], chrs[i2 + 2]);
              if(i2 + 3 < length) {
                ret.push(separator[i]);
              }
            }

            if(!i) {
              ret.reverse();
            }

            return ret.join("");
          }).join(this.number.decimal);
        };

        return Localisations;
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

  function getJson(url) {
    return fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    }).then(function (res) {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      }

      // TODO add error object instead of false
      return Promise.reject(false);
    });
  }

  i18n = {
    translations: {
      base: (document.documentElement.getAttribute("data-i18n-base") || "locales/"),
      set: (document.documentElement.getAttribute("data-i18n-set") || "translation"),

      load: function(lang, set, base) {
        var url;
        base = base || this.base || "";
        lang = lang || language;
        set = set || this.set;
        url = base + lang + "/" + set + ".json";

        debug.info("loading translations for %s from: %s", lang, url);

        return getJson(url).then(function(obj) {
            debug.info("successfully loaded translations for %s", lang);
            return new Translations(lang || language, obj);
        }).catch(function (err) {
          debug.error("Error loading translations for %s: %o", lang, err);
          return Promise.reject(err);
        });
      },
      loadDefault: function() {
        return this.loaded || this.reloadDefault();
      },
      reloadDefault: function() {
        return (this.loaded = this.load());
      },

      apply: function(ele) {
        this.loadDefault();

        return this.loaded.then(function(translations) {
          return translations.translate(ele);
        });
      },
      applyAll: function() {
        this.appliedAll = true;
        return this.apply(document.documentElement);
      },

      get: function(path) {
        this.loadDefault();

        return this.loaded.then(function(obj) {
          return obj.find(path);
        });
      }
    },

    localisations: {
      base: (document.documentElement.getAttribute("data-i18n-localisations-base") || "localisations/"),
      load: function(lang, base) {
        var url;
        base = base || this.base || "";
        lang = lang || language;
        url = base + lang + ".json";

        debug.info("loading localisations for %s from: %s", lang, url);

        return getJson(url).then(function(obj) {
            debug.info("successfully loaded localisations for %s", lang);
            return new Localisations(lang || language, obj);
        }).catch(function (err) {
          debug.error("Error loading localisations for %s: %o", lang, err);
          return Promise.reject(err);
        });
      },
      loadDefault: function() {
        return this.loaded || this.reloadDefault();
      },
      reloadDefault: function() {
        return (this.loaded = this.load());
      },

      apply: function(ele) {
        this.loadDefault();

        return this.loaded.then(function(localisations) {
          return localisations.localise(ele);
        });
      },
      applyAll: function() {
        this.appliedAll = true;
        return this.apply(document.documentElement);
      }
    },

    set language(lang) {
      lang = String(lang);

      if(lang !== language) {
        language = lang;

        if(this.translations.loaded) {
          this.translations.reloadDefault();
        }
        if(this.translations.appliedAll) {
          this.translations.applyAll();
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
    i18n.translations.applyAll();
  }

  return i18n;
}));
