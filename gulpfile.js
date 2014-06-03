var gulp    = require('gulp');
var grep    = require('gulp-grep-stream');
var mocha   = require('gulp-mocha');
var plumber = require('gulp-plumber');
var traceur = require('gulp-traceur');
var watch   = require('gulp-watch');

var path = {
  src: './src/**/*.js',
  pkg: './package.json'
};

// gulp.task('build_source_cjs', function() {
//   gulp.src(path.src)
//       .pipe(traceur(pipe.traceur({modules: 'commonjs'})))
//       .pipe(gulp.dest('dist/cjs'));
// });


gulp.task('default', function() {

  return gulp.src('src/**/*.js')
    .pipe(watch({ emit: 'all' }, function(files) {
      var dist = files
        .pipe(traceur({sourceMap: false}))
        .pipe(gulp.dest('dist'))

      dist.pipe(mocha({ reporter: 'dot' }))
        .on('error', function(err) {
          if (!/spec? failed/.test(err.stack)) {
            console.log(err.stack);
          }
          this.emit('end');
        });

      return dist;
    }));
});
