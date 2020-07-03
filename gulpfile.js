// папка проекта
const distFolder = "dist";
// папка исходников
const srcFolder = "src";
// файловая система
const fs = require("fs");

const { src, dest, parallel, series, lastRun, watch } = require("gulp");

// пути
const path = {
  // проект
  build: {
    html: `${distFolder}/`,
    css: `${distFolder}/`,
    js: `${distFolder}/`,
    img: `${distFolder}/img/`,
    fonts: `${distFolder}/fonts/`,
  },
  // исходники
  src: {
    html: `${srcFolder}/index.html`,
    css: `${srcFolder}/css/index.css`,
    js: `${srcFolder}/js/index.js`,
    img: `${srcFolder}/**/*.{jpg,png,gif,ico,webp}`,
    fonts: `${srcFolder}/fonts/*.ttf`,
  },
  // отслеживание
  watch: {
    html: `${srcFolder}/**/*.html`,
    css: `${srcFolder}/**/*.scss`,
    js: `${srcFolder}/**/*.js`,
    img: `${srcFolder}/**/*.{jpg,png,gif,ico,webp}`,
  },
  // очистка
  clean: `./${distFolder}/`,
};

// модули и т.д.
const htmlInclude = require("gulp-html-tag-include");   // объединение html
const webpHtml = require("gulp-webp-html");             // webp в html

const postcss = require("gulp-postcss");                // postcss
const importcss = require("postcss-import");            // import css
const media = require("postcss-media-minmax");          // @media (width >= 320px)
const autoprefixer = require("autoprefixer");           // autoprefixer
const mqpacker = require("css-mqpacker");               // группирует @media
const prettier = require("gulp-prettier");              // prettier
const webpcss = require("gulp-webpcss");                // webpcss
const cssnano = require("cssnano");                     // сжатие css

const fileInclude = require("gulp-file-include");       // подключение файлов (работает для всех)
const babel = require("gulp-babel");                    // babel
const terser = require("gulp-terser");                  // сжатие js

const imageMin = require('gulp-imagemin');              // сжатие картинок
const webp = require('gulp-webp');                      // конвертация в webp

const ttf2woff2 = require('gulp-ttf2woff2');            // ttf2woff2

const del = require('del');                             // удалить папки/файлы
const rename = require("gulp-rename");                  // переименовать файл
const flatten = require('gulp-flatten');                // работа с путями к файлу
const browserSync = require("browser-sync").create();   // браузер

// HTML

const html = () => src(path.src.html)
  .pipe(htmlInclude())
  .pipe(webpHtml())
  .pipe(dest(path.build.html))
  .pipe(browserSync.stream());

// CSS

const css = () => src(path.src.css)
  .pipe(
    postcss([
      importcss(),
      media(),
      mqpacker({
        sort: true,
      }),
      autoprefixer(),
    ])
  )
  .pipe(
    webpcss({
      webpClass: ".webp",
      noWebpClass: ".no-webp",
    })
  )
  .pipe(prettier())
  .pipe(dest(path.build.css))
  .pipe(browserSync.stream());

// JS

const js = () =>
  src(path.src.js)
    .pipe(fileInclude())
    .pipe(dest(path.build.js))

    .pipe(
      babel()
    )
    .pipe(
      rename({
        extname: ".es5.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());

// min JS & CSS

const minjs = () => src([`${path.build.js}index.js`, `${path.build.js}index.es5.js`])
  .pipe(terser())
  .pipe(
    rename({
      extname: ".min.js",
    })
  )
  .pipe(dest(path.build.js))
  .pipe(browserSync.stream());

const mincss = () => src([`${path.build.css}index.css`])
  .pipe(postcss([cssnano()]))
  .pipe(
    rename({
      extname: ".min.css",
    })
  )
  .pipe(dest(path.build.css));

// img

const img = () => src(path.src.img, { since: lastRun(img) })
  .pipe(
    webp({
      quality: 70,
    }),
  )
  .pipe(flatten())                // удалить относительный путь к картинке
  .pipe(dest(path.build.img))

  .pipe(src(path.src.img))
  .pipe(
    imageMin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3,
    }),
  )
  .pipe(flatten())                // удалить относительный путь к картинке
  .pipe(dest(path.build.img))
  .pipe(browserSync.stream());

// fonts

const fonts = () => src(path.src.fonts)
  .pipe(ttf2woff2())
  .pipe(dest(path.build.fonts));

// запись шрифтов в fonts.css
// требуется откорректировать файл

const fontsStyle = (cb) => {
  const fileContent = fs.readFileSync(`${srcFolder}/css/global/fonts.css`).toString();
  if (fileContent === '') {
    fs.writeFileSync(`${srcFolder}/css/global/fonts.css`, '/* Fonts */\r\n');
    let cFontname;
    fs.readdirSync(path.build.fonts).forEach((item) => {
      const fontname = item.split('.')[0];
      if (cFontname !== fontname) {
        fs.appendFileSync(`${srcFolder}/css/global/fonts.css`,
          `@font-face {
  font-family: '${fontname}';
  font-display: swap;
  src: url('../fonts/${fontname}.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
}\r\n\r\n`);
      }
      cFontname = fontname;
    });
  }
  cb();
};

// clean

const clean = () => del(path.clean);

// syns

const browser = () => {
  browserSync.init({
    server: {
      baseDir: `./${distFolder}/`,
    },
    port: 3000,
    notify: false,
  });
};

// watch

const watchFiles = () => {
  watch(path.watch.html, html);
  watch(path.watch.css, css);
  watch(path.watch.js, js);
  watch(path.watch.img, img);
};

// cобрать проект
const build = series(
  clean, parallel(series(js, minjs), css, html, img, fonts),
  fontsStyle,
);
// запустить собранный проект
const watchBrowser = parallel(watchFiles, browser);

exports.html = html;
exports.css = css;
exports.js = js;
exports.mincssjs = parallel(mincss, minjs);;

exports.img = img;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;

exports.browser = browser;
exports.watchFiles = watchFiles;

exports.clean = clean;

exports.build = build;
exports.default = series(build, watchBrowser);