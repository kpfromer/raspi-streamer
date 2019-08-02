const { src, dest, series, parallel, watch } = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const rsync = require('gulp-rsync');
const { exec } = require('child_process');
const path = require('path');

const buildFolder = 'dist';
const hostname = 'pi@192.168.0.100';
const destination = '/home/pi/backend'; 
const tsProject = ts.createProject('tsconfig.json');

const clean = done => del(buildFolder).then(() => done());

const buildTs = () => 
  src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(dest(buildFolder));

// TODO: check if files have changed!
const buildReact = done => {
  // Build react
  exec('cd ../frontend && npm run build', (error, stdout, sterr) => {
    console.log(stdout);
    console.log(sterr);
    done(error);
  });
}

const moveReact = () => 
  src('../frontend/build/**/*')
    .pipe(dest(path.join(buildFolder, 'react')));

const deployFiles = () => 
  src(`./${buildFolder}/**`)
    .pipe(rsync({
      root: buildFolder,
      hostname,
      destination,
      compress: true,
      progress: true
    }));

const deployPackage = () =>
  src(['package.json', 'package-lock.json'])
    .pipe(rsync({
      hostname,
      destination,
      compress: true,
      progress: true
    }));

const deployReact = () =>
  src(['../frontend/build/**'])
    .pipe(rsync({
      root: '../frontend/build',
      hostname,
      destination: path.join(destination, 'react'),
      compress: true,
      progress: true
    }));

const build = series(clean, parallel(series(buildReact, moveReact), buildTs));

const watchFiles = () => {
  watch('../frontend/**/*', () => {
    console.log('Deploying react.');
    return series(buildReact, deployReact);
  });
  watch('./src/**/*', () => {
    console.log('Deploying src files.');
    return series(clean, buildTs, deployFiles);
  });
  watch(['package.json', 'package-lock.json'], () => {
    console.log('Deploying package files.');
    return deployPackage;
  });
}

module.exports = {
  clean,
  build,
  buildReact,
  deployFiles: series(clean, buildTs, deployFiles),
  deployReact: series(buildReact, deployReact),
  deploy: series(deployPackage, build, deployFiles),
  watch: watchFiles
}