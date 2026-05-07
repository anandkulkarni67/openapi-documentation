#!/bin/bash

artifact_version=$1

echo 'build_script'

rm -rf *.zip

npm version $artifact_version --no-git-tag-version
if [ $? -ne 0 ]; then
  echo 'Failed to update application version. Please input correct application version before initiating another build.'
  exit 1
fi

cd api

rm -rf node_modules

rm -rf dist

npm install

npm run tests
if [ $? -ne 0 ]; then
  echo 'Tests failed. Please fix tests before initiating another build.'
  exit 1
fi

npm run build

application_version=$(npm --loglevel silent run version)

zip -r '$application_version.zip' ./

echo '$(ls -l)'