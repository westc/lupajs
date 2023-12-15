const gulp = require('gulp');
const babel = require('gulp-babel');
const babelCore = require('@babel/core');
const terser = require('terser');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const htmlMinifier = require('html-minifier');
const CleanCSS = require('clean-css');
const fs = require('fs');

const cssSrc = 'src/lupa.css';
const htmlSrc = 'src/lupa.html';
const jsSrc = 'src/lupa.js';
const jsIframeSrc = 'src/lupa-iframe.js';
const dirDest = 'dist';
const jsDest = `${dirDest}/lupa.js`;

const babelOptions = {
  // presets: ['@babel/preset-env']
};

// Read the content of the HTML, CSS and IFRAME JS file
const jsIframeContent = fs.readFileSync(jsIframeSrc, 'utf8');

/** @type {{[key in ("CSS"|"HTML"|"JS_IFRAME"|"JS_IFRAME_MIN")]?: string}} */
const PLACEHOLDER_VALUES = {};


function getReplacer(useJsIframeMin=false) {
  return replace(
    /((?<=^|\r|\n)(?:(?!\r|\n)\s)*|)\[\[(\w+)_FILE_PLACEHOLDER\]\]/g,
    (_, prefix, type) => {
      const result = PLACEHOLDER_VALUES[(type === 'JS_IFRAME' && useJsIframeMin) ? 'JS_IFRAME_MIN' : type];
      return prefix ? result.replace(/^/gm, prefix) : result;
    }
  );
}


// Watch for changes and run the build-js task
gulp.task('watch', function () {
  gulp.watch(
    [cssSrc, htmlSrc, jsSrc, jsIframeSrc],
    gulp.series(

      // Define the placeholder values.
      async function definePlaceholderValues() {
        if (Object.keys(PLACEHOLDER_VALUES).length) return;
      
        Object.assign(PLACEHOLDER_VALUES, {
          CSS: JSON.stringify(new CleanCSS().minify(fs.readFileSync(cssSrc, 'utf8')).styles),
          HTML: JSON.stringify(htmlMinifier.minify(fs.readFileSync(htmlSrc, 'utf8'), {
            collapseWhitespace: true,
            removeComments: false,
          })),
          JS_IFRAME: jsIframeContent,
          JS_IFRAME_MIN: (await terser.minify(
            babelCore.transformSync(jsIframeContent, babelOptions).code
          )).code
        });
      },

      // Define a task to transpile and minify JavaScript
      async function buildMiniJS(done) {
        // Read the content of the HTML file
        const cssContent = new CleanCSS().minify(fs.readFileSync(cssSrc, 'utf8')).styles;
        const htmlContent = htmlMinifier.minify(fs.readFileSync(htmlSrc, 'utf8'), {
          collapseWhitespace: true,
          removeComments: false,
        });
      
        return gulp.src(jsSrc)
          .pipe(getReplacer(true))
          .pipe(gulp.dest(dirDest));
      },

      // Define a task to transpile and minify JavaScript
      function buildJS() {
        return gulp.src(jsSrc)
          .pipe(getReplacer())
          .pipe(rename({ suffix: '.full' }))
          .pipe(gulp.dest(dirDest));
      },

      async function minifyJS() {
        return gulp.src(jsDest)
          .pipe(babel(babelOptions))
          .pipe(uglify({
            compress: { unused: false },
            mangle: false
          }))
          .pipe(rename({ suffix: '.min' }))
          .pipe(gulp.dest(dirDest));
      }

    )
  );
});

// Default task: Run 'watch' as a default task
gulp.task('default', gulp.series('watch'));
