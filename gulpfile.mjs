import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import browserSyncPkg from 'browser-sync';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const cheerio = require("gulp-cheerio");
import autoprefixer from 'gulp-autoprefixer';
import consolidate from 'gulp-consolidate';
import wait from 'gulp-wait';
import svgSprite from 'gulp-svg-sprite';
import template from 'gulp-template-html';
import index from 'gulp-index';
import changed from 'gulp-changed';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const sassCompiler = gulpSass(sass);
const browserSync = browserSyncPkg.create();
const argv = yargs(hideBin(process.argv)).argv;
const mobile = argv.mobile ? true : false;
const rootDir = mobile ? "Mobile" : "HTML-PC";
const AUTOPREFIXER_BROWSERS = [
  'last 2 versions', '> 1%', 'ie >= 9', 'ff >= 30',
  'chrome >= 34', 'safari >= 7', 'opera >= 23',
  'ios >= 7', 'android >= 4', 'bb >= 10'
];

// BrowserSync Server
function browserSyncTask(done) {
  browserSync.init({
    port: 3000,
    directory: true,
    server: { baseDir: '.' },
    startPath: `./${rootDir}`
  });
  done();
}

// Compile SCSS
function sassTask() {
  return gulp.src(`${rootDir}/css/scss/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(wait(500))
    .pipe(sassCompiler({ outputStyle: 'compressed' }).on('error', sassCompiler.logError))
    .pipe(autoprefixer({ overrideBrowserslist: AUTOPREFIXER_BROWSERS }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(`${rootDir}/css`))
    .pipe(browserSync.stream());
}

// SVG Combine
function svgCombine() {
  return gulp.src(`${rootDir}/images/symbols/elements/*.svg`)
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>"),
    }))
    .pipe(cheerio({
      run: function ($) {
        $("*").removeAttr("fill");    // ✅ Xóa fill
        $("*").removeAttr("stroke");  // ❌ Nếu icon cần stroke, BỎ DÒNG NÀY
        //$("svg").attr("fill", "none"); // ✅ Đặt mặc định fill="none"
        //$("svg").attr("stroke", "black");  //✅ Nếu icon cần stroke
      },
      parserOptions: { xmlMode: true },
    }))
    .pipe(svgSprite({
      mode: {
        symbol: {
          render: { css: false, scss: false },
          dest: `${rootDir}/images/icons`,
          dimensions: "-icon",
          prefix: "svg-",
          sprite: "icon.svg",
          example: true,
        },
      },
    }))
    .pipe(gulp.dest("."));
}



// SVG Icon Font (Async Import)
async function svgIconFont() {
  const iconfontModule = await import('gulp-iconfont');
  const iconfont = iconfontModule.default;

  return gulp.src(`${rootDir}/images/symbols/elements/*.svg`)
    .pipe(iconfont({
      fontName: 'iconfont',
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      normalize: true,
      fontHeight: 1000
    }))
    .on('glyphs', function (glyphs, options) {
      gulp.src(`${rootDir}/images/symbols/iconfont-src/iconfont.css`)
        .pipe(consolidate('underscore', { glyphs, fontName: options.fontName, fontDate: new Date().getTime() }))
        .pipe(gulp.dest(`${rootDir}/css/fonts/iconfont`));

      gulp.src(`${rootDir}/images/symbols/iconfont-src/index.html`)
        .pipe(consolidate('underscore', { glyphs, fontName: options.fontName }))
        .pipe(gulp.dest(`${rootDir}/css/fonts/iconfont`));
    })
    .pipe(gulp.dest(`${rootDir}/css/fonts/iconfont`));
}

// SVG Task (Parallel)
const svgTask = gulp.parallel(svgCombine, svgIconFont);

// Build Template
function buildTemplate() {
  return gulp.src(`${rootDir}/app/page/*.html`)
    .pipe(changed(`${rootDir}/css`))
    .pipe(template(`${rootDir}/app/template/main.html`))
    .pipe(gulp.dest(rootDir));
}

// Build Index
function buildIndex() {
  const prependFile = './_app/index-partials/index-front-matter.html';
  const appendFile = './_app/index-partials/index-end-matter.html';

  return gulp.src(['HTML-PC/*.html', 'Mobile/*.html'])
    .pipe(index({
      'prepend-to-output': () => fs.existsSync(prependFile) ? fs.readFileSync(prependFile) : '',
      'append-to-output': () => fs.existsSync(appendFile) ? fs.readFileSync(appendFile) : '',
      title: 'Pages List',
      pathDepth: 1,
      relativePath: './',
      outputFile: './index.html'
    }))
    .pipe(gulp.dest('./'));
}

// Watcher
function watchFiles() {
  gulp.watch(`${rootDir}/css/scss/*.scss`, sassTask);
  gulp.watch(`${rootDir}/images/symbols/elements/**/*.svg`, svgTask);
  gulp.watch(`${rootDir}/*.html`).on('change', browserSync.reload);
  gulp.watch(`${rootDir}/js/**/*.js`).on('change', browserSync.reload);
  gulp.watch(`${rootDir}/images/**/*`).on('change', browserSync.reload);
  gulp.watch(`${rootDir}/app/**/*.html`, buildTemplate);
  gulp.watch(`${rootDir}/*.html`, { events: ['add'] }, buildIndex);
}

// Default Task
const defaultTask = gulp.series(gulp.parallel(sassTask, buildTemplate, buildIndex, browserSyncTask, svgCombine), watchFiles);

// Export tasks
export { sassTask as sass, svgTask as svg, buildTemplate, buildIndex, svgCombine, watchFiles as watch };
export default defaultTask;
