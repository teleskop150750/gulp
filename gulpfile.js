import gulp from 'gulp'; // gulp
import webpack from 'webpack-stream'; // webpack
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
import autoprefixer from 'autoprefixer'; // вендорные префиксы
import prettier from 'gulp-prettier'; // форматировать
import rename from 'gulp-rename'; // изментить расширение файла на .css
import cssnano from 'cssnano'; // сжать css
// IMG
import webp from 'gulp-webp'; // конвертировать в webp
import imagemin from 'gulp-imagemin'; // сжать изображения
// FONTS
import fonter from 'gulp-fonter'; // otf => ttf
import ttf2woff2 from 'gulp-ttf2woff2'; // ttf => woff2
// работа с файлами
import fs from 'fs'; // файловая система
import del from 'del'; // удалить папки/файлы
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
    css: `${srcFolder}/css/index.pcss`,
    js: `${srcFolder}/js/index.js`,
    fonts: `${srcFolder}/fonts/`,
  },
  // отслеживание
  watch: {
    html: `${srcFolder}/**/*.html`,
    css: `${srcFolder}/**/*.pcss`,
    js: `${srcFolder}/**/*.js`,
    img: [`${srcFolder}/**/img/*`, `${srcFolder}/favicon/*`],
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
      autoprefixer(),
    ]),
  )
  .pipe(prettier())
  .pipe(rename({
    extname: '.css',
  }))
  .pipe(dest(path.build.css))
  .pipe(browserSync.stream());

// JS

const webConfig = {
  output: {
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: '/node_modules/',
      },
    ],
  },
  mode: 'development',
  devtool: 'source-map',
};

export const js = () => src(path.src.js)
  .pipe(webpack(webConfig))
  .pipe(dest(path.build.js))
  .pipe(browserSync.stream());

// img
export const img = () => {
  const srchArr = []; // массив путей к картинкам в папке blocks
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
    del(path.src.fonts + file.basename); // заменить ots на ttf
  })
  .pipe(
    fonter({
      formats: ['ttf'],
    }),
  )
  .pipe(dest(path.src.fonts));

export const ttf = () => src(`${path.src.fonts}*.ttf`)
  .on('data', (file) => {
    del(path.src.fonts + file.basename); // заменить ttf на woff2
  })
  .pipe(ttf2woff2())
  .pipe(dest(path.src.fonts));

export const copyWoff = () => src(`${path.src.fonts}*.{woff,woff2}`).pipe(dest(path.build.fonts));

/**
 * подключение шрифтов в fonts.pcss (подключение происходит в пустой файл)
 * требуется откорректировать названиие шрифтов и их начертание
*/

export const fontsStyle = (cb) => {
  const fileContent = fs.readFileSync(`${srcFolder}/css/global/fonts.pcss`).toString(); // получить содержимое файла
  // проверить содержимое файла
  if (fileContent === '') {
    fs.writeFileSync(`${srcFolder}/css/global/fonts.pcss`, '/* Fonts */\n\n'); // добавить заглавный комментарий
    let cFontName = ''; // копия названия файла (шрифта)
    // прочитать содержимое папки
    fs.readdirSync(path.build.fonts).forEach((item) => {
      const fontName = item.split('.')[0]; // получить имя файла (шрифта)
      // сравнить с копией, чтобы исключить повторы
      if (cFontName !== fontName) {
        fs.appendFileSync(
          `${srcFolder}/css/global/fonts.pcss`, // записать структуру подключения в файл
          `@font-face {
  font-family: '${fontName}';
  font-display: swap;
  src: url('fonts/${fontName}.woff2') format('woff2');
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

export const fonts = series(otf, ttf, copyWoff, fontsStyle);

// min HTML CSS JS IMG

export const minHTML = () => src([`${path.build.html}*.html`])
  .pipe(
    htmlmin({
      removeComments: true,
      collapseWhitespace: true,
    }),
  )
  .pipe(dest(path.minBuild.html));

export const minCSS = () => src([`${path.build.css}*.css`])
  .pipe(postcss([cssnano()]))
  .pipe(dest(path.minBuild.css));

const webConfigMin = {
  output: {
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: '/node_modules/',
      },
    ],
  },
  mode: 'production',
  devtool: 'none',
};

export const minJS = () => src(path.src.js)
  .pipe(webpack(webConfigMin))
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

export const copyToMin = () => src([`${distFolder}/fonts/**/*`, `${path.build.img}*.webp`], {
  base: distFolder,
}).pipe(dest(minFolder));

// clean dist

export const clean = () => del(distFolder);

// clean min

export const cleanMin = () => del(minFolder);

// sync

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
  watch(path.watch.fonts, series(otf, ttf, copyWoff));
};

export const watchBrowser = parallel(watchFiles, browser);

// cобрать проект
export const build = parallel(
  html,
  css,
  js,
  img,
  series(
    otf,
    ttf,
    copyWoff,
    fontsStyle,
  ),
);

export const min = series(
  cleanMin,
  parallel(
    minHTML,
    minCSS,
    minJS,
    minIMG,
    copyToMin,
  ),
);

export default series(clean, build, watchBrowser);
