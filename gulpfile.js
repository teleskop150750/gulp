// модули
import gulp from 'gulp'; // gulp
// HTML
import htmlInclude from 'gulp-html-tag-include'; // собрать html
import webpHtml from 'gulp-webp-html'; // <img src="img.jpg"> => <picture><source srcset="img.webp" type="image/webp"><img src="img.jpg"></picture>
import beautify from 'gulp-jsbeautifier'; // форматировать
import htmlmin from 'gulp-htmlmin'; // сжать html
// CSS
import postcss from 'gulp-postcss'; // postcss
import importcss from 'postcss-import'; // собрать css
import nested from 'postcss-nested'; // позволяет использовать вложенность scss
import media from 'postcss-media-minmax'; // @media (width >= 320px) => @media (min-width: 320px)
import mqpacker from 'css-mqpacker'; // сгруппировать @media
import autoprefixer from 'autoprefixer'; // autoprefixer
import prettier from 'gulp-prettier'; // форматировать
import cssnano from 'cssnano'; // сжать css
// JS
import fileInclude from 'gulp-file-include'; // собрать файлы
import babel from 'gulp-babel'; // babel
import terser from 'gulp-terser'; // сжать js
// IMG
import webp from 'gulp-webp'; // конвертировать в webp
import imagemin from 'gulp-imagemin'; // сжать изображения
// FONTS
import fonter from 'gulp-fonter'; // otf => ttf
import ttf2woff2 from 'gulp-ttf2woff2'; // ttf => woff2
// работа с файлами
import fs from 'fs'; // файловая система
import del from 'del'; // удалить папки/файлы
import rename from 'gulp-rename'; // переименовать файл
import debug from 'gulp-debug'; // debug
import changed from 'gulp-changed'; // пропустить только новые файлы
import browserSync from 'browser-sync'; // браузер

const {
  src, dest, parallel, series, watch,
} = gulp;

// папка проекта
const distFolder = 'dist';
// папка c сжатым проектом
const minFolder = 'min';
// папка исходников
const srcFolder = 'src';

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
  // сжатый проект
  minBuild: {
    html: `${minFolder}/`,
    css: `${minFolder}/`,
    js: `${minFolder}/`,
    img: `${minFolder}/img/`,
    fonts: `${minFolder}/fonts/`,
  },
  // исходники
  src: {
    html: `${srcFolder}/index.html`,
    css: `${srcFolder}/css/index.css`,
    js: `${srcFolder}/js/index.js`,
    img: [`${srcFolder}/**/img/*.{jpg,png,svg,gif,ico,webp}`, `!${srcFolder}/favicon`],
    fonts: `${srcFolder}/fonts/`,
  },
  // отслеживание
  watch: {
    html: `${srcFolder}/**/*.html`,
    css: `${srcFolder}/**/*.css`,
    js: `${srcFolder}/**/*.js`,
    img: `${srcFolder}/**/img/*`,
    fonts: `${srcFolder}/fonts/*`,
  },
};

// HTML

export const html = () => src(path.src.html)
  .pipe(htmlInclude())
  .pipe(webpHtml())
  .pipe(beautify())
  .pipe(dest(path.build.html))
  .pipe(browserSync.stream());

// CSS

export const css = () => src(path.src.css)
  .pipe(
    postcss([
      importcss(),
      nested(),
      media(),
      mqpacker({
        sort: true,
      }),
      autoprefixer(), // вендорные префиксы
    ]),
  )
  .pipe(prettier())
  .pipe(dest(path.build.css))
  .pipe(browserSync.stream());

// JS

export const js = () => src(path.src.js)
  .pipe(fileInclude())
  .pipe(prettier())
  .pipe(dest(path.build.js))

  .pipe(
    babel({
      presets: ['@babel/preset-env'],
    }),
  )
  .pipe(
    rename({
      extname: '.es5.js',
    }),
  )
  .pipe(dest(path.build.js))
  .pipe(browserSync.stream());

// img
export const img = () => {
  const srchArr = [];
  fs.readdirSync(`${srcFolder}/blocks/`).forEach((block) => {
    const pathImg = `${srcFolder}/blocks/${block}/img/*.{jpg,png,}`;
    srchArr.push(pathImg);
  });

  return src(srchArr)
    .pipe(changed(path.build.img, { extension: '.webp' }))
    .pipe(debug({ title: 'webp:' }))
    .pipe(webp({
      quality: 75, // коэффициент качества между 0 и 100
      method: 4, // метод сжатия, который будет использоваться между 0(самым быстрым) и 6(самым медленным).
    }))
    .pipe(dest(path.build.img))

    .pipe(src(srchArr))
    .pipe(changed(path.build.img))
    .pipe(debug({ title: 'copy:' }))
    .pipe(dest(path.build.img))

    .pipe(src(`${srcFolder}/favicon/*`))
    .pipe(changed(path.build.img))
    .pipe(debug({ title: 'favicon:' }))
    .pipe(dest(path.build.img));
};

// fonts

export const otf = () => src(`${path.src.fonts}*.otf`)
  .on('data', (file) => {
    del(path.src.fonts + file.basename);
  })
  .pipe(
    fonter({
      formats: ['ttf'],
    }),
  )
  .pipe(dest(path.src.fonts));

export const ttf2 = () => src(`${path.src.fonts}*.ttf`)
  .on('data', (file) => {
    del(path.src.fonts + file.basename);
  })
  .pipe(ttf2woff2())
  .pipe(dest(path.src.fonts));

export const copyWoff = () => src(`${path.src.fonts}*.{woff,woff2}`).pipe(dest(path.build.fonts));

// запись шрифтов в fonts.css
// файл должен быть изначально пустой
// в конце требуется откорректировать названиие шрифтов и их начертание

export const fontsStyle = (cb) => {
  const fileContent = fs.readFileSync(`${srcFolder}/css/global/fonts.css`).toString(); // получаем содержимое файла
  // проверяем пустой ли файл
  if (fileContent === '') {
    fs.writeFileSync(`${srcFolder}/css/global/fonts.css`, '/* Fonts */\n\n'); // записываем заглавный комментарий
    let cFontName = ''; // копия названия файла (шрифта)
    // читаем содержимое папки
    fs.readdirSync(path.build.fonts).forEach((item) => {
      const fontName = item.split('.')[0]; // получаем имя файла (шрифта)
      // сравниваем с копияей, чтобы исключить повторы
      if (cFontName !== fontName) {
        fs.appendFileSync(
          `${srcFolder}/css/global/fonts.css`, // завписываем структуру подключения в файл
          `@font-face {
  font-family: '${fontName}';
  font-display: swap;
  src: url('../fonts/${fontName}.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
}\n\n`,
        );
      }
      cFontName = fontName;
    });
  }
  cb();
};

// min HTML CSS JS IMG

export const minHTML = () => src([`${path.build.html}*.html`]) // сжимаем css
  .pipe(
    htmlmin({
      removeComments: true,
      collapseWhitespace: true,
    }),
  )
  .pipe(dest(path.minBuild.html));

export const minCSS = () => src([`${path.build.css}*.css`]) // сжимаем css
  .pipe(postcss([cssnano()]))
  .pipe(dest(path.minBuild.css));

export const minJS = () => src([`${path.build.js}*.js`, `${path.build.js}*.es5.js`])
  .pipe(src([`${path.build.js}*.js`]))
  .pipe(terser())
  .pipe(dest(path.minBuild.js));

export const minIMG = () => src(`${path.build.img}*.{jpg,png,svg,}`)
  .pipe(changed(path.minBuild.img))
  .pipe(debug({ title: 'min:' }))
  .pipe(
    imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
      }),
    ]),
  )
  .pipe(dest(path.minBuild.img));

export const copy = () => src([`${distFolder}/fonts/**/*`, `${path.build.img}*.webp`], {
  base: distFolder,
}).pipe(dest(minFolder));

// clean dist

export const clean = () => del(distFolder);

// clean min

export const cleanMin = () => del(minFolder);

// syns

export const browser = () => {
  browserSync.init({
    server: {
      baseDir: `./${distFolder}/`,
    },
    port: 3000,
    notify: false,
  });
};

// watch

export const watchFiles = () => {
  watch(path.watch.html, html);
  watch(path.watch.css, css);
  watch(path.watch.js, js);
  watch(path.watch.img, img);
  watch(path.watch.fonts, series(otf, ttf2, copyWoff));
};

// cобрать проект
export const build = parallel(html, css, js, img, series(otf, ttf2, copyWoff, fontsStyle));

// запустить watcher и браузер
export const watchBrowser = parallel(watchFiles, browser);

export default series(clean, build, watchBrowser);

// exports.build = build;
// exports.clean = clean;
// exports.watchFiles = watchFiles;
// exports.browser = browser;

// exports.html = html;
// exports.css = css;
// exports.js = js;

// exports.img = img;

// exports.otf = otf;
// exports.ttf2 = ttf2;
// exports.copyWoff = copyWoff;

export const fonts = series(otf, ttf2, copyWoff, fontsStyle);

// exports.clean = clean;
// exports.cleanMin = cleanMin;

export const min = series(cleanMin, parallel(minHTML, minCSS, minJS, minIMG, copy));
