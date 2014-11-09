#!/bin/sh
output=$(sed -e 's/  //g' script.js | tr -s '\r\n' ' ')
echo "javascript:$output" | pbcopy
