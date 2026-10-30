[1mdiff --git a/gulpfile.js b/gulpfile.js[m
[1mindex 796190a..02208bc 100644[m
[1m--- a/gulpfile.js[m
[1m+++ b/gulpfile.js[m
[36m@@ -63,6 +63,9 @@[m [mfunction images(done) {[m
    if (remaining === 0) return done();[m
 [m
    files.forEach(file => {[m
[32m+[m[32m      const outPath = path.join(distDir, file);[m
[32m+[m[32m      fs.mkdirSync(path.dirname(outPath), { recursive: true });[m
[32m+[m
       sharp(path.join(srcDir, file))[m
          .toFile(path.join(distDir, file), (err) => {[m
             if (err) console.error(err);[m
