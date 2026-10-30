const gulp = require('gulp');
const { series, parallel, watch } = gulp;
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
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
      .pipe(postcss([
         autoprefixer({ overrideBrowserslist: ['last 2 versions', '> 0.5%'] })
      ]))
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

// raster images: copy through sharp + make a .webp copy of jpg/png
async function images() {
   const srcDir = 'src/images';
   const distDir = 'dist/images';
   const rasterFormats = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
   const webpFrom = ['.png', '.jpg', '.jpeg'];

   function walk(dir) {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
         const fullPath = path.join(dir, entry.name);
         return entry.isDirectory() ? walk(fullPath) : [fullPath];
      });
   }

   const files = walk(srcDir).filter(file => !file.toLowerCase().endsWith('.svg'));

   await Promise.all(files.map(async (file) => {
      const relPath = path.relative(srcDir, file);
      const outPath = path.join(distDir, relPath);
      const ext = path.extname(file).toLowerCase();

      await fs.promises.mkdir(path.dirname(outPath), { recursive: true });

      if (!rasterFormats.includes(ext)) {
         await fs.promises.copyFile(file, outPath); // gif и прочее
         return;
      }

      await sharp(file).toFile(outPath);

      if (webpFrom.includes(ext)) {
         const webpPath = outPath.slice(0, -ext.length) + '.webp';
         await sharp(file).webp({ quality: 85 }).toFile(webpPath);
      }
   }));
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