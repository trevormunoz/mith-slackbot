/*jslint node: true */

'use strict';

/**
*
* Deploy nodejs project to AWS Lambda.
*
*/

require('dotenv').load();

var gulp = require('gulp');
var format = require('util').format;
var gutil = require('gulp-util');
var zip = require('gulp-zip');
var del = require('del');
var install = require('gulp-install');
var runSequence = require('run-sequence');
var AWS = require('aws-sdk');
var fs = require('fs');

gulp.task('clean', function(callback) {
  return del(['./dist', './dist.zip'], callback);
});

gulp.task('js', function() {
  return gulp.src(['index.js'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('env', function() {
  return gulp.src('./.env')
    .pipe(gulp.dest('./dist'));
});

gulp.task('node-modules', function() {
  return gulp.src('./package.json')
    .pipe(gulp.dest('dist/'))
    .pipe(install({production: true}));
});

gulp.task('zip', function() {
  return gulp.src(['dist/**/*', 'dist/.env', '!dist/package.json'])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('upload', function() {

  var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
  var pkgInfo = require('./package.json');

  function getCodeZipFile(callback) {
    fs.readFile('./dist.zip', function(err, data){
      if(err) {
        var warning = 'Unable to read zip file: ';
        warning += err.message;
        gutil.log(warning);
      } else {
        callback(data);
      }
    });
  }

  function updateFunctionCode() {
    gutil.log(format('Updating function code for %s', pkgInfo.name));
    getCodeZipFile(function(data) {
      var params = {
        'FunctionName': pkgInfo.name,
        'ZipFile': data
      };

      lambda.updateFunctionCode(params, function(err, data) {
        if (err) {
          var warning = 'Package upload failed: ';
          warning += err.message;
          gutil.log(warning);
        } else {
          var info = [
            format('Name: %s', data.FunctionName),
            format('Identifier: %s', data.FunctionArn),
            format('Description: %s', data.Description),
            format('Last Update: %s', data.LastModified)
          ].join('\n');

          gutil.log('Successfully updated code for lambda function.\n', gutil.colors.yellow.bgBlack(info));
        }
      });
    });
  }

  gutil.log(format('Checking for lambda function: %s', pkgInfo.name));
  lambda.getFunction({FunctionName: pkgInfo.name}, function(err, data) {
    var lambdaFunction = null;
    if(err) {
      var warning = '';
      if(err.statusCode === 404) {
        warning = 'Unable to find lambda function with that name.';
      } else {
        warning = 'AWS API request failed.';
        warning += err.message;
      }
      gutil.log(warning);
    } else {
      lambdaFunction = data;
      if(lambdaFunction !== null) {
        updateFunctionCode();
      }
    }

  });
});

gulp.task('deploy', function(callback) {
  return runSequence(
    'clean',
    ['js', 'node-modules', 'env'],
    'zip',
    'upload',
    callback
  );
});
