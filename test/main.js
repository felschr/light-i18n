/* global i18n, describe, it, beforeEach, afterEach, expect */
/* jshint globalstrict: true, devel: true */

"use strict";

describe("light-i18n", function() {
  var langDialect = navigator.userLanguage || navigator.language,
    lang = langDialect.split("-")[0];

  describe("#loadTranslations(lang, set, base)", function() {
    it("should load translations for current language when no lang attribute is given", function(done) {
      i18n.loadTranslations().then(function(obj) {
        expect(obj.language).to.be.equal(lang);
        done();
      });
    });

    it("should load translations for given language", function(done) {
      i18n.loadTranslations("de").then(function(obj) {
        expect(obj.language).to.be.equal("de");
        done();
      });
    });

    it("should load no translations for non-existing language", function(done) {
      var error = console.error;
      console.error = function(_, e) {
        expect(e).to.be.equal(e);
        console.error = error;
        done();
      };

      i18n.loadTranslations("ka").catch(function() {
        done();
      });
    });
  });

  describe("#translate(ele)", function() {
    var ele;

    beforeEach(function() {
      ele = document.createElement("div");
    });

    it("should work when property is not nested", function(done) {
      ele.setAttribute("data-i18n", "test");

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test1");
        done();
      });
    });

    it("should remove previous content", function(done) {
      ele.setAttribute("data-i18n", "test");
      ele.innerHTML = "test123";

      i18n.translate(ele).then(function() {
        expect(ele.childNodes.length).to.be.equal(1);
        expect(ele.innerHTML).to.be.equal("test1");
        done();
      });
    });

    it("should set lang attribute", function(done) {
      ele.setAttribute("data-i18n", "test");
      ele.lang = "de";

      i18n.translate(ele).then(function() {
        expect(ele.lang).to.be.equal(i18n.language);
        done();
      });
    });

    it("should not change anything when undefined", function(done) {
      ele.setAttribute("data-i18n", "test42");
      ele.innerHTML = "test43";

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test43");
        done();
      });
    });

    it("should warn & not change anything when object", function(done) {
      var warn = console.warn;
      ele.setAttribute("data-i18n", "test2");
      ele.innerHTML = "test43";

      console.warn = function(_, ele2, path) {
        expect(ele2).to.be.equal(ele);
        expect(path).to.be.equal("test2");
        expect(ele.innerHTML).to.be.equal("test43");
        console.warn = warn;
        done();
      };
      i18n.translate(ele);
    });

    it("should work when nested", function(done) {
      ele.setAttribute("data-i18n", "test2.test4");

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test5");
        done();
      });
    });

    it("should work when nested", function(done) {
      ele.setAttribute("data-i18n", "test2.test4");

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test5");
        done();
      });
    });

    it("should work when number", function(done) {
      ele.setAttribute("data-i18n", "test2.test3");

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("42");
        done();
      });
    });

    it("should not translate if lang attribute matches language", function(done) {
      // "test": "test1"
      ele.setAttribute("data-i18n", "test");
      ele.innerHTML = "test";
      ele.lang = lang;

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test");
        done();
      });
    });

    it("should add every element of an array as paragraph", function(done) {
      // "testArray": ["test1", "test2"]
      ele.setAttribute("data-i18n", "testArray");

      i18n.translate(ele).then(function() {
        expect(ele.childNodes.length).to.be.equal(2);
        expect(ele.childNodes[0].nodeName).to.be.equal("P");
        expect(ele.childNodes[1].nodeName).to.be.equal("P");
        expect(ele.childNodes[0].innerHTML).to.be.equal("test1");
        expect(ele.childNodes[1].innerHTML).to.be.equal("test2");
        done();
      });
    });
  });

  describe("#translateAll()", function() {
    var testEle;

    beforeEach(function() {
      var i, ele;

      testEle = document.createElement("div");
      testEle.hidden = true;

      for (i = 0; i < 5; ++i) {
        ele = document.createElement("div");
        ele.setAttribute("data-i18n", "testAll" + i);
        testEle.appendChild(ele);
      }

      document.body.appendChild(testEle);
    });

    it("should return document.documentElement with all translations applied", function(done) {
      i18n.translateAll().then(function() {
        [].slice.call(testEle.children).forEach(function(ele, i) {
          expect(ele.innerHTML).to.be.equal("result " + i);
        });
        done();
      });
    });

    afterEach(function() {
      document.body.removeChild(testEle);
    });
  });

  describe("#language", function() {
    it("should return new language when setting it", function(done) {
      i18n.language = "de";
      expect(i18n.language).to.be.equal("de");

      i18n.translations.then(function(obj) {
        expect(obj.language).to.be.equal("de");
        done();
      });
    });
  });
});
