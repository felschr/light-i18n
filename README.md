# light-i18n

A lightweight, client-based internationalization library for javascript.

## About

An JavaScript library by Felix Schröter.

See the [project homepage](http://FelschR.github.io/light-i18n).

## Installation

###manual installation
To embed light-i18n into your HTML website include the following:
```HTML
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
```JSON
{
  "header": {
    "home": "Startseite",
    "imprint": "Impressum"
  },
  "content" : {
    "welcomeMsg": "Wilkommen"
  }
}
```

You can set the translation on an HTML element via the attribute `i18n`:
```HTML
<p i18n="content.welcomeMsg">Welcome</p>
```
The example above will show "Welcome" as default text and if a translation with the key `content.welcomeMsg` is available it will insert the translation to the innerHTML of the element.

For advanced usage, see the documentation.

## Documentation

Start with `docs/MAIN.md`.

## License

MIT. See `LICENSE` in this directory.
