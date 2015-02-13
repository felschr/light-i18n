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
      ele.setAttribute("i18n", "test");
      
      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test1");
        done();
      });
    });

    it("should warn & not change anything when undefined", function(done) {
      var warn = console.warn;
      ele.setAttribute("i18n", "test42");
      ele.innerHTML = "test43";

      console.warn = function(_, path) {
        expect(path).to.be.equal("test42");
        console.warn = warn;
        done();
      };
      i18n.translate(ele);
    });

    it("should work when nested", function(done) {
      ele.setAttribute("i18n", "test2.test4");

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test5");
        done();
      });
    });

    it("should work when nested", function(done) {
      ele.setAttribute("i18n", "test2.test4");

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test5");
        done();
      });
    });

    it("should work when number", function(done) {
      ele.setAttribute("i18n", "test2.test3");

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("42");
        done();
      });
    });

    it("should not translate if lang attribute matches dialect", function(done) {
      // "test": "test1"
      ele.setAttribute("i18n", "test");
      ele.innerHTML = "test";
      ele.lang = navigator.language;

      i18n.translate(ele).then(function() {
        expect(ele.innerHTML).to.be.equal("test");
        done();
      });
    });
  });
});
