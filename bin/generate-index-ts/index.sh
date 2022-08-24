#!/bin/sh
export CWD=$(pwd)
cd $(dirname $0)
tsx ./index.ts $@
