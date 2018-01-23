/* global i18n, describe, it, expect */

'use strict'

var i18n = require('../src/main');

describe('i18n.language', () => {
  test('should return new language when setting it', done => {
    i18n.language = 'de'
    expect(i18n.language).to.be.equal('de')

    i18n.translations.loaded.then(function (obj) {
      expect(obj.language).to.be.equal('de')

      i18n.language = 'en'
      expect(i18n.language).to.be.equal('en')
      return i18n.translations.loaded
    }).then(function (obj) {
      expect(obj.language).to.be.equal('en')
      done()
    })
  })
})
