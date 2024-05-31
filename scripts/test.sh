#!/bin/sh
set -eu

node --test --experimental-test-coverage --test-reporter=spec "**/*.test.js"