/* global i18n, describe, it, beforeEach, expect */
/* jshint globalstrict: true, devel: true */

"use strict";

describe("light-i18n", function() {
  describe("#loadTranslations(lang, set, base)", function() {
    it("should load translations for current language when no lang attribute is given", function(done) {
      i18n.loadTranslations().then(function(obj) {
        expect(obj.fetch("langTest")).to.be.equal("en");
        expect(obj.fetch("test2.test3")).to.be.equal(42);
        done();
      });
    });

    it("should load translations for given language", function(done) {
      i18n.loadTranslations("de").then(function(obj) {
        expect(obj.fetch("langTest")).to.be.equal("de");
        expect(obj.fetch("test2.test3")).to.be.equal(84);
        done();
      });
    });

    it("should load no translations for non-existing language", function(done) {
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

    it("should not translate if lang attribute matches dialect", function(done) {
      // "test": "test1"
      ele.setAttribute("data-i18n", "test");
      ele.innerHTML = "test";
      ele.lang = navigator.userLanguage || navigator.language;

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
    var ele,
        testEle,
        i;

    beforeEach(function() {
      testEle = document.createElement("div");
      document.documentElement.appendChild(testEle);

      for (i = 0; i < 5; i++) {
        ele = document.createElement("div");
        ele.setAttribute("data-i18n", "testAll" + i);
        testEle.appendChild(ele);
      }
    });

    it("should return document.documentElement with all translations applied", function(done) {
      i18n.translateAll().then(function() {
        i = 0;
        [].slice.call(testEle.children).forEach(function(ele) {
          expect(ele).to.be.equal("testAll" + i);
          i++;
        });
        done();
      });
    });
  });
  describe("#language", function() {
    it("should return new language when setting it", function(done) {
      i18n.language = "fr";
      expect(i18n.language).to.be.equal("fr");
      done();
    });
  });
});
