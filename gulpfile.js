import gulp from 'gulp'
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'
import cssnano from 'gulp-cssnano'
import uglify from 'gulp-uglify'
import fileInclude from 'gulp-file-include'
import browserSync from 'browser-sync'
import prettier from 'gulp-prettier'
import concat from 'gulp-concat'

const sass = gulpSass(dartSass)
const bs = browserSync.create()

//HTML
const html = () => {
  return gulp.src('src/*.html')
    .pipe(fileInclude({ prefix: '@@', basepath: 'src' }))
    .pipe(prettier({ parser: 'html' }))
    .pipe(gulp.dest('dist'))
    .pipe(bs.stream())
}

//SCSS
const styles = () => {
  return gulp.src('src/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(gulp.dest('dist/css'))
    .pipe(bs.stream())
}

//JS
const scripts = () => {
  return gulp.src([
    'src/js/utils/*.js',
    'src/js/components/*.js',
    'src/js/main.js'
  ])
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(bs.stream())
}

//Images
const images = () => {
  return gulp.src('src/assets/**/*')
    .pipe(gulp.dest('dist/assets'))
}

//Watch
const watch = () => {
  bs.init({
    server: { baseDir: 'dist' },
    port: 3000,
    open: true
  })
  gulp.watch('src/**/*.html', html)
  gulp.watch('src/scss/**/*.scss', styles)
  gulp.watch('src/js/**/*.js', scripts)
  gulp.watch('src/assets/**/*', images)
}

//Build
const build = gulp.series(html, styles, scripts, images)

//Dev
const dev = gulp.series(build, watch)

export { build, dev }
export default dev