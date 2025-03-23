var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var svgmin = require('gulp-svgmin');
var autoprefixer = require('gulp-autoprefixer');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var notify = require('gulp-notify');
var wait = require('gulp-wait');
var svgSprite = require('gulp-svg-sprite');
var template = require('gulp-template-html');
var index = require('gulp-index');
var changed = require('gulp-changed');
var fs = require('fs');

var argv = require('yargs').argv;
var mobile = argv.mobile || false;
mobile = (mobile == true) ? true : false;

var rootDir = mobile == true ? "Mobile" : "HTML-PC";

const AUTOPREFIXER_BROWSERS = [
  'last 2 version',
  '> 1%',
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4',
  'bb >= 10'
];

// Development Tasks 
// -----------------

// Start browserSync server
gulp.task('browserSync', function () {
  browserSync({
    port: 3000,
    directory: true,
    server: {
      baseDir: '.'
    },
    startPath: "./" + rootDir
  })
})

gulp.task('sass', function () {
  return gulp.src(rootDir + '/css/scss/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(wait(500))
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(rootDir + '/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})



// SVG Combine
gulp.task('svg-combine', function () {
  return gulp.src(rootDir + '/images/symbols/elements/*.svg')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(svgmin({
      plugins: [{
          removeDoctype: false
        },
        {
          removeAttrs: {
            attrs: 'fill'
          }
        }, {
          removeComments: false
        }, {
          cleanupNumericValues: {
            floatPrecision: 2
          }
        }, {
          convertColors: {
            names2hex: false,
            rgb2hex: false
          }
        }
      ]
    }))
    .pipe(svgSprite({
      mode: {
        symbol: { // symbol mode to build the SVG
          render: {
            css: false, // CSS output option for icon sizing
            scss: false // SCSS output option for icon sizing
          },
          dest: rootDir + '/images/icons', // destination folder
          dimensions: "-icon",
          prefix: 'svg-', // BEM-style prefix if styles rendered
          sprite: 'icon.svg', //generated sprite name
          example: true // Build a sample page, please!
        }
      },
    }))
    .pipe(gulp.dest('.'))
});

// SVG font
gulp.task('svg-iconfont', function () {
  return gulp.src(rootDir + '/images/symbols/elements/*.svg')
    .pipe(iconfont({
      fontName: 'iconfont',
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      appendCodepoints: true,
      appendUnicode: false,
      normalize: true,
      fontHeight: 1000,
      centerHorizontally: true
    }))
    .on('glyphs', function (glyphs, options) {
      gulp.src(rootDir + '/images/symbols/iconfont-src/iconfont.css')
        .pipe(consolidate('underscore', {
          glyphs: glyphs,
          fontName: options.fontName,
          fontDate: new Date().getTime()
        }))
        .pipe(gulp.dest(rootDir + '/css/fonts/iconfont'));

      gulp.src(rootDir + '/images/symbols/iconfont-src/index.html')
        .pipe(consolidate('underscore', {
          glyphs: glyphs,
          fontName: options.fontName
        }))
        .pipe(gulp.dest(rootDir + '/css/fonts/iconfont'));
    })
    .pipe(gulp.dest(rootDir + '/css/fonts/iconfont'));
});
gulp.task('svg', ['svg-combine', 'svg-iconfont'], function (done) {
  browserSync.reload();
  done();
});


// Build template
gulp.task("build-template", function () {
  return gulp.src(rootDir + '/app/page/*.html')
    .pipe(changed(rootDir + '/css'))
    .pipe(template(rootDir + '/app/template/main.html'))
    .pipe(gulp.dest(rootDir));
});

// Build Index Demo
gulp.task('buildIndex', function () {
  return gulp
    .src(['HTML-PC/*.html', 'Mobile/*.html'])
    .pipe(
      index({
        'prepend-to-output': () =>
          fs.readFileSync('./_app/index-partials/index-front-matter.html'),
        'append-to-output': () =>
          fs.readFileSync('./_app/index-partials/index-end-matter.html'),
        title: 'Pages List',
        pathDepth: 1,
        'relativePath': './',
        'outputFile': './index.html',
        'section-template': (sectionContent) => `<section class="index__section">
        ${sectionContent}</section>
        `,
        'section-heading-template': (heading) => `<h2 class="index__section-heading">${heading}</h2>
        `,
        'list-template': (listContent) => `<ul class="index__list">
        ${listContent}</ul>
        `,
        'item-template': (
          filepath,
          filename
        ) => `<li class="index__item"><a class="index__item-link" target="_blank" href="${filepath}/${filename}">${filename}</a></li>
                    `
      })
    )
    .pipe(gulp.dest('./'));
});

// Watchers
gulp.task('watch', function () {
  gulp.watch(rootDir + '/css/scss/*.scss', ['sass']);
  gulp.watch(rootDir + '/images/symbols/elements/**/*.svg', ['svg']);
  gulp.watch(rootDir + '/*.html', browserSync.reload);
  gulp.watch(rootDir + '/js/**/*.js', browserSync.reload);
  gulp.watch(rootDir + '/images/**/*', browserSync.reload);
  gulp.watch(rootDir + '/app/**/*.html', ['build-template']);
  gulp.watch(rootDir + '/*.html', {
    events: ['add']
  }, ['buildIndex']);
})

gulp.task('default', function (callback) {
  runSequence(['sass', 'build-template', 'buildIndex', 'browserSync'], 'watch',
    callback
  )
})