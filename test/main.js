/* global i18n, describe, it, expect */
/* jshint globalstrict: true, devel: true */

"use strict";

describe("i18n.language", function() {
  it("should return new language when setting it", function(done) {
    i18n.language = "de";
    expect(i18n.language).to.be.equal("de");

    i18n.translations.loaded.then(function(obj) {
      expect(obj.language).to.be.equal("de");

      i18n.language = "en";
      expect(i18n.language).to.be.equal("en");
      return i18n.translations.loaded;
    }).then(function(obj) {
      expect(obj.language).to.be.equal("en");
      done();
    });
  });
});
