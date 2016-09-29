# light-i18n [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![Code Climate](https://codeclimate.com/github/FelschR/light-i18n/badges/gpa.svg)](https://codeclimate.com/github/FelschR/light-i18n)

#### A lightweight, client-based internationalization library for javascript without the need of any server code.

Translations can easily be implemented by creating json files for each language.
Each translation can be referenced via ```data-i18n``` attribute of any HTML element. When the website is loaded the child elements of the elements with the ```data-i18n``` attribute will be replaced by the translation.

## About

A javascript library by Felix Schröter and Malte-Maurice Dreyer.

## Installation

###manual installation
To embed light-i18n into your HTML website include the following:
```html
<script src="scripts/light-i18n.js"></script>
```

###using bower
light-i18n will soon also be downloadable as a bower package. Check back later.

## Usage

Basic usage is as follows:

The translations are saved in a folder called `locales` which is in the root of your website.
Inside this folder each translation also gets it's own folder which is named after the lowercase language key (de, en, fr, ...). The translation files are called `translation.json`.
It should look like this:
```
.
└── locales
    ├── en
    │   └── translation.json
    ├── de
    │   └── translation.json
    └── fr
        └── translation.json
```

Set up the translations in a JSON file like this:
```json
{
  "header": {
    "home": "Startseite",
    "imprint": "Impressum"
  },
  "content" : {
    "intro": ["Willkommen!", "Seht euch gerne um."]
  }
}
```
You can set the translation on an HTML element via the attribute `data-i18n`:
```html
<p data-i18n="header.imprint">Imprint</p>
```
The example above will show "Imprint" as default text and if a translation with the key `header.imprint` is available it will insert the translation to the innerHTML of the element.

As seen in the JSON it's also possible to use arrays. Using `data-i18n="content.intro"` will insert 2 HTML paragraphs.

For advanced usage, see the documentation.

## Documentation

Start with `docs/MAIN.md`.

## License

MIT. See `LICENSE` in this directory.
