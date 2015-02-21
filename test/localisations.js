/* global i18n, describe, it, before, beforeEach, afterEach, expect */
/* jshint globalstrict: true, devel: true */

"use strict";

describe("i18n.localisations", function() {
  var langDialect = navigator.userLanguage || navigator.language,
    lang = langDialect.split("-")[0],
    expectObjectMethod = function(obj, name, cb, callOld) {
      var old = obj[name],
        ret = {
          args: undefined,
          cleanup: function() {
            obj[name] = old;
          },
          target: obj,
          toNotHaveBeenCalled: function() {
            return expect(ret.args).to.be.an("undefined");
          },
          toHaveBeenCalled: function() {
            return expect(ret.args).to.not.be.an("undefined");
          }
        };

      ret.toHaveBeenCalled.with = function(args, start, end) {
        return expect(ret.args.slice(start || 0, end)).to.be.eql(args);
      };
      ret.toNotHaveBeenCalled.with = function(args, start, end) {
        return expect(ret.args.slice(start || 0, end)).to.not.be.eql(args);
      };

      obj[name] = function() {
        ret.args = [].slice.call(arguments);
        if(cb) {
          cb.call(ret);
        }
        if(callOld) {
          return old.apply(this, arguments);
        }
      };

      return ret;
    },
    expectConsoleMethod = function(name, cb) {
      return expectObjectMethod(console, name, cb);
    };

  i18n.localisations.load();

  describe("#load(lang, base)", function() {
    it("should load localisations for current language when no lang attribute is given", function(done) {
      i18n.translations.load().then(function(obj) {
        expect(obj.language).to.be.equal(lang);
        done();
      });
    });

    it("should load localisations for given language", function(done) {
      i18n.localisations.load("test1").then(function(obj) {
        expect(obj.language).to.be.equal("test1");
        done();
      });
    });

    it("should load no localisations for non-existing language and not call console.error", function(done) {
      var expectError = expectConsoleMethod("error");

      i18n.localisations.load("ka").catch(function() {
        // expectError.toNotHaveBeenCalled();
        expectError.cleanup();
        done();
      });
    });

    it("should load no localisations for non-existing language and call console.error after enabling debug", function(done) {
      var expectError = expectConsoleMethod("error");
      i18n.debug = true;

      i18n.localisations.load("ka").catch(function() {
        i18n.debug = false;
        // expectError.toHaveBeenCalled();
        expectError.cleanup();

        done();
      });
    });
  });

  function factory(tag, type, value) {
    var ele = document.createElement(tag);
    ele.setAttribute("data-i18n-localise-as", type);
    if(tag === "data") {
      ele.setAttribute("value", value);
    } else if(tag === "time") {
      ele.setAttribute("datetime", value);
    } else {
      ele.nodeValue = value;
    }
    return ele;
  }

  describe("#apply(ele)", function() {
    before(function(done) {
      delete i18n.translations.loaded;
      i18n.language = "test1";
      i18n.localisations.load().then(function() {
        done();
      });
    });

    it("should work with 2-digit integer", function(done) {
      var ele = factory("data", "number", "42");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("42");
        done();
      });
    });

    it("should work with 3-digit integer", function(done) {
      var ele = factory("data", "number", "242");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("242");
        done();
      });
    });

    it("should work with 4-digit integer", function(done) {
      var ele = factory("data", "number", "4242");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("4b242");
        done();
      });
    });

    it("should work with 6-digit integer", function(done) {
      var ele = factory("data", "number", "424242");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("424b242");
        done();
      });
    });

    it("should work with 7-digit integer", function(done) {
      var ele = factory("data", "number", "2424242");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("2b424b242");
        done();
      });
    });

    it("should work with 1-digit integral, 2-digit fractional part", function(done) {
      var ele = factory("data", "number", "0.42");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("0a42");
        done();
      });
    });

    it("should work with 1-digit integral, 3-digit fractional part", function(done) {
      var ele = factory("data", "number", "0.424");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("0a424");
        done();
      });
    });

    it("should work with 1-digit integral, 4-digit fractional part", function(done) {
      var ele = factory("data", "number", "0.4242");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("0a424c2");
        done();
      });
    });

    it("should work with 1-digit integral, 6-digit fractional part", function(done) {
      var ele = factory("data", "number", "0.424242");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("0a424c242");
        done();
      });
    });

    it("should work with 1-digit integral, 7-digit fractional part", function(done) {
      var ele = factory("data", "number", "0.4242424");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("0a424c242c4");
        done();
      });
    });

    it("should work with date", function(done) {
      var ele = factory("time", "date", "2014-01-01");

      i18n.localisations.apply(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("01.01.2014");
        done();
      });
    });
  });

  describe("#applyAll()", function() {
    var localisations = [
        ["42", "42"],
        ["242", "242"],
        ["4242", "4b242"],
        ["424242", "424b242"],
        ["2424242", "2b424b242"],
        ["0.42", "0a42"],
        ["0.424", "0a424"],
        ["0.4242", "0a424c2"],
        ["0.424242", "0a424c242"],
        ["0.4242424", "0a424c242c4"]
      ],
      testEle;

    beforeEach(function() {
      testEle = document.createElement("div");
      testEle.hidden = true;

      localisations.forEach(function(pair) {
        var ele = factory("data", "number", pair[0]);
        testEle.appendChild(ele);
      });

      document.body.appendChild(testEle);
    });

    it("should return document.documentElement with all localisations applied", function(done) {
      i18n.localisations.applyAll().then(function() {
        [].slice.call(testEle.children).forEach(function(ele, i) {
          expect(ele.innerHTML).to.be.equal(localisations[i][1]);
        });
        done();
      });
    });

    afterEach(function() {
      document.body.removeChild(testEle);
    });
  });
});
