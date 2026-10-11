const gulp = require('gulp');
const { series, parallel, watch } = gulp;
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ---------- helpers ----------
function reload(done) {
   browserSync.reload();
   done();
}

// ---------- tasks ----------
function clean() {
   return gulp.src('dist', { read: false, allowEmpty: true })
      .pipe(require('gulp-clean')());
}

function html() {
   return gulp.src('src/*.html')
      .pipe(gulp.dest('dist'));
}

function styles() {
   return gulp.src('src/scss/main.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCSS())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist/css'))
      .pipe(browserSync.stream());
}

function scripts() {
   return gulp.src('src/js/**/*.js')
      .pipe(terser())
      .pipe(gulp.dest('dist/js'));
}

// SVG is copied as is (sharp can't write SVG)
function svg() {
   return gulp.src('src/images/**/*.svg', { encoding: false, allowEmpty: true })
      .pipe(gulp.dest('dist/images'));
}

// raster images (png, jpg, webp...) go through sharp
function images(done) {
   const srcDir = 'src/images';
   const distDir = 'dist/images';
   if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

   const files = fs.readdirSync(srcDir).filter(file => {
      const isFile = fs.statSync(path.join(srcDir, file)).isFile();
      return isFile && !file.toLowerCase().endsWith('.svg');
   });

   let remaining = files.length;
   if (remaining === 0) return done();

   files.forEach(file => {
      sharp(path.join(srcDir, file))
         .toFile(path.join(distDir, file), (err) => {
            if (err) console.error(err);
            remaining--;
            if (remaining === 0) done();
         });
   });
}

function fonts() {
   return gulp.src('src/fonts/**/*', { encoding: false, allowEmpty: true })
      .pipe(gulp.dest('dist/fonts'));
}

function serve() {
   browserSync.init({
      server: { baseDir: 'dist' }
   });
}

function watchFiles() {
   watch('src/scss/**/*.scss', styles);
   watch('src/*.html', series(html, reload));
   watch('src/js/**/*.js', series(scripts, reload));
   watch('src/images/**/*.svg', series(svg, reload));
   watch(['src/images/**/*', '!src/images/**/*.svg'], series(images, reload));
   watch('src/fonts/**/*', series(fonts, reload));
}

// ---------- pipelines ----------
const build = series(clean, parallel(styles, scripts, images, svg, fonts, html));
const dev = series(build, parallel(serve, watchFiles));

exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.images = images;
exports.svg = svg;
exports.fonts = fonts;
exports.watch = watchFiles;
exports.build = build;
exports.dev = dev;
exports.default = dev;