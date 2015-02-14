/* global i18n, describe, it, beforeEach, expect */
/* jshint globalstrict: true, devel: true */

"use strict";

describe("light-i18n", function() {
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

    it("should warn & not change anything when undefined", function(done) {
      var warn = console.warn;
      ele.setAttribute("data-i18n", "test42");
      ele.innerHTML = "test43";

      console.warn = function(_, ele2, path) {
        expect(ele2).to.be.equal(ele);
        expect(path).to.be.equal("test42");
        console.warn = warn;
        done();
      };
      i18n.translate(ele);
    });

    it("should warn & not change anything when object", function(done) {
      var warn = console.warn;
      ele.setAttribute("data-i18n", "test2");
      ele.innerHTML = "test43";

      console.warn = function(_, ele2, path) {
        expect(ele2).to.be.equal(ele);
        expect(path).to.be.equal("test2");
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
});
