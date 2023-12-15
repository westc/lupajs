const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const htmlMinifier = require('html-minifier');
const CleanCSS = require('clean-css');
const fs = require('fs');

const cssSrc = 'src/lupa.css';
const htmlSrc = 'src/lupa.html';
const jsSrc = 'src/lupa.js';
const dirDest = 'dist';
const jsDest = `${dirDest}/lupa.js`;

// Define a task to transpile and minify JavaScript
gulp.task('build-js', gulp.series(
  function (done) {
    // Read the content of the HTML file
    const cssContent = new CleanCSS().minify(fs.readFileSync(cssSrc, 'utf8')).styles;
    const htmlContent = htmlMinifier.minify(fs.readFileSync(htmlSrc, 'utf8'), {
      collapseWhitespace: true,
      removeComments: false,
    });
    
    // Replace EXTERNAL_HTML_FILE with the HTML content
    gulp.src(jsSrc)
      .pipe(replace('EXTERNAL_CSS_FILE_FROM_GULP', JSON.stringify(cssContent)))
      .pipe(replace('EXTERNAL_HTML_FILE_FROM_GULP', JSON.stringify(htmlContent)))
      .pipe(gulp.dest(dirDest));
    done();
  },
  function (done) {
    gulp.src(jsDest)
      .pipe(babel())
      .pipe(uglify({
        compress: { unused: false },
        mangle: false
      }))
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(dirDest));
    done();
  }
));

// Watch for changes and run the build-js task
gulp.task('watch', function () {
  gulp.watch([cssSrc, htmlSrc, jsSrc], gulp.series('build-js'));
});

// Default task: Run 'watch' as a default task
gulp.task('default', gulp.series('watch'));
