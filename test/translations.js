/* global i18n, describe, it, beforeEach, afterEach, expect */

;'use strict'

describe('i18n.translations', function () {
  var langDialect = navigator.userLanguage || navigator.language
  var lang = langDialect.split('-')[0]
  var expectObjectMethod = function (obj, name, cb, callOld) {
    var old = obj[name]
    var ret = {
      args: undefined,
      cleanup: function () {
        obj[name] = old
      },
      target: obj,
      toNotHaveBeenCalled: function () {
        return expect(ret.args).to.be.an('undefined')
      },
      toHaveBeenCalled: function () {
        return expect(ret.args).to.not.be.an('undefined')
      }
    }

    ret.toHaveBeenCalled.with = function (args, start, end) {
      return expect(ret.args.slice(start || 0, end)).to.be.eql(args)
    }
    ret.toNotHaveBeenCalled.with = function (args, start, end) {
      return expect(ret.args.slice(start || 0, end)).to.not.be.eql(args)
    }

    obj[name] = function () {
      ret.args = [].slice.call(arguments)
      if (cb) {
        cb.call(ret)
      }
      if (callOld) {
        return old.apply(this, arguments)
      }
    }

    return ret
  }
  var expectConsoleMethod = function (name, cb) {
    return expectObjectMethod(console, name, cb)
  }

  describe('#load(lang, set, base)', function () {
    it('should load translations for current language when no lang attribute is given', function (done) {
      i18n.translations.load().then(function (obj) {
        expect(obj.language).to.be.equal(lang)
        done()
      })
    })

    it('should load translations for given language', function (done) {
      i18n.translations.load('de').then(function (obj) {
        expect(obj.language).to.be.equal('de')
        done()
      })
    })

    it('should load no translations for non-existing language and not call console.error', function (done) {
      var expectError = expectConsoleMethod('error')

      i18n.translations.load('ka').catch(function () {
        expectError.toNotHaveBeenCalled()
        expectError.cleanup()
        done()
      })
    })

    it('should load no translations for non-existing language and call console.error after enabling debug', function (done) {
      var expectError = expectConsoleMethod('error')
      i18n.debug = true

      i18n.translations.load('ka').catch(function () {
        i18n.debug = false
        expectError.toHaveBeenCalled()
        expectError.cleanup()

        done()
      })
    })
  })

  describe('#apply(ele)', function () {
    var ele

    beforeEach(function () {
      ele = document.createElement('div')
    })

    it('should work when property is not nested', function (done) {
      ele.setAttribute('data-i18n', 'test')

      i18n.translations.apply(ele).then(function () {
        expect(ele.innerHTML).to.be.equal('test1')
        done()
      })
    })

    it('should remove previous content', function (done) {
      ele.setAttribute('data-i18n', 'test')
      ele.innerHTML = 'test123'

      i18n.translations.apply(ele).then(function () {
        expect(ele.childNodes.length).to.be.equal(1)
        expect(ele.innerHTML).to.be.equal('test1')
        done()
      })
    })

    it('should set lang attribute', function (done) {
      ele.setAttribute('data-i18n', 'test')
      ele.lang = 'de'

      i18n.translations.apply(ele).then(function () {
        expect(ele.lang).to.be.equal(i18n.language)
        done()
      })
    })

    it('should not change anything when undefined', function (done) {
      ele.setAttribute('data-i18n', 'test42')
      ele.innerHTML = 'test43'

      i18n.translations.apply(ele).then(function () {
        expect(ele.innerHTML).to.be.equal('test43')
        done()
      })
    })

    it('should not warn & not change anything when object', function (done) {
      var expectWarn = expectConsoleMethod('warn')
      ele.setAttribute('data-i18n', 'test2')
      ele.innerHTML = 'test43'

      i18n.translations.apply(ele).then(function () {
        expectWarn.toNotHaveBeenCalled()
        done()
      })
    })

    it('should warn & not change anything when object and debug', function (done) {
      var expectWarn = expectConsoleMethod('warn')
      ele.setAttribute('data-i18n', 'test2')
      ele.innerHTML = 'test43'
      i18n.debug = true

      i18n.translations.apply(ele).then(function () {
        expectWarn.toHaveBeenCalled.with([ele, 'test2'], 1)
        done()
      })
    })

    it('should work when nested', function (done) {
      ele.setAttribute('data-i18n', 'test2.test4')

      i18n.translations.apply(ele).then(function () {
        expect(ele.innerHTML).to.be.equal('test5')
        done()
      })
    })

    it('should work when nested', function (done) {
      ele.setAttribute('data-i18n', 'test2.test4')

      i18n.translations.apply(ele).then(function () {
        expect(ele.innerHTML).to.be.equal('test5')
        done()
      })
    })

    it('should work when number', function (done) {
      ele.setAttribute('data-i18n', 'test2.test3')

      i18n.translations.apply(ele).then(function () {
        expect(ele.innerHTML).to.be.equal('42')
        done()
      })
    })

    it('should not translate if lang attribute matches language', function (done) {
      // "test": "test1"
      ele.setAttribute('data-i18n', 'test')
      ele.innerHTML = 'test'
      ele.lang = lang

      i18n.translations.apply(ele).then(function () {
        expect(ele.innerHTML).to.be.equal('test')
        done()
      })
    })

    it('should add every element of an array as paragraph', function (done) {
      // "testArray": ["test1", "test2"]
      ele.setAttribute('data-i18n', 'testArray')

      i18n.translations.apply(ele).then(function () {
        expect(ele.childNodes.length).to.be.equal(2)
        expect(ele.childNodes[0].nodeName).to.be.equal('P')
        expect(ele.childNodes[1].nodeName).to.be.equal('P')
        expect(ele.childNodes[0].innerHTML).to.be.equal('test1')
        expect(ele.childNodes[1].innerHTML).to.be.equal('test2')
        done()
      })
    })
  })

  describe('#applyAll()', function () {
    var testEle

    beforeEach(function () {
      var i
      var ele

      testEle = document.createElement('div')
      testEle.hidden = true

      for (i = 0; i < 5; ++i) {
        ele = document.createElement('div')
        ele.setAttribute('data-i18n', 'testAll' + i)
        testEle.appendChild(ele)
      }

      document.body.appendChild(testEle)
    })

    it('should return document.documentElement with all translations applied', function (done) {
      i18n.translations.applyAll().then(function () {
        [].slice.call(testEle.children).forEach(function (ele, i) {
          expect(ele.innerHTML).to.be.equal('result ' + i)
        })
        done()
      })
    })

    afterEach(function () {
      document.body.removeChild(testEle)
    })
  })

  describe('#language', function () {
    it('should return new language when setting it', function (done) {
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

  describe('#get(path)', function () {
    it('should work', function (done) {
      Promise.all(['test', 'test2.test3', 'test2.test4'].map(function (path) {
        return i18n.translations.get(path)
      })).then(function (vals) {
        expect(vals).to.be.eql(['test1', 42, 'test5'])
        done()
      })
    })
  })
})
