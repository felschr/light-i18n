fetchMock = require('fetch-mock');
var fs = require('fs');

fetchMock.get('locales/en/translation.json', {
  "test": "test1",
  "test2": {
    "test3": 42,
    "test4": "test5"
  },
  "testArray": ["test1", "test2"],
  "testAll0": "result 0",
  "testAll1": "result 1",
  "testAll2": "result 2",
  "testAll3": "result 3",
  "testAll4": "result 4",
  "langTest": "en"
});

fetchMock.get('locales/de/translation.json', {
  "test": "test1 de",
  "test2": {
    "test3": 84,
    "test4": "test5 de"
  },
  "testArray": ["test1 de", "test2 de"],
  "testAll0": "result 0 de",
  "testAll1": "result 1 de",
  "testAll2": "result 2 de",
  "testAll3": "result 3 de",
  "testAll4": "result 4 de",
  "langTest": "de"
});

fetchMock.get('localisations/en.json', {
  "number": {
    "decimal": ".",
    "thousands": "\u202F",
    "thousandths": "\u202F",
    "unit": "\u202F"
  }
});

fetchMock.get('localisations/de.json', {
  "number": {
    "decimal": ",",
    "thousands": "\u202F",
    "thousandths": "\u202F",
    "unit": "\u202F"
  },
  "time": {
    "date": {
      "default": "alternativeNumeric.long",
      "numeric": {
        "long": "%Y-%m-%d",
        "short": "%{year2Digits}-%m-%d"
      },
      "alternativeNumeric": {
        "long": "%d.%m.%Y",
        "short": "%d.%m.%{year2Digits}"
      },
      "alphanumeric": {
        "long": "%d. %{monthName} %Y",
        "short": "%d. %{monthNameShort}. %{year2Digits}"
      }
    },
    "time": {
      "default": "full",
      "full": "%H:%i:%s\u00A0Uhr",
      "minutes": "%H:%i\u00A0Uhr",
      "hours": "%{hourWithoutLeadingZero}\u00A0Uhr"
    }
  }
});

fetchMock.get('localisations/test1.json', {
  "number": {
    "decimal": "a",
    "thousands": "b",
    "thousandths": "c",
    "unit": "d"
  },
  "time": {
    "date": {
      "default": "alternativeNumeric.long",
      "numeric": {
        "long": "%Y-%m-%d",
        "short": "%{year2Digits}-%m-%d"
      },
      "alternativeNumeric": {
        "long": "%d.%m.%Y",
        "short": "%d.%m.%{year2Digits}"
      },
      "alphanumeric": {
        "long": "%d. %{monthName} %Y",
        "short": "%d. %{monthNameShort}. %{year2Digits}"
      }
    },
    "time": {
      "default": "full",
      "full": "%H:%i:%s\u00A0Uhr",
      "minutes": "%H:%i\u00A0Uhr",
      "hours": "%{hourWithoutLeadingZero}\u00A0Uhr"
    }
  }
});
