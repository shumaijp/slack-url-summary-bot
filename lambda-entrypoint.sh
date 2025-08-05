#!/bin/sh

# Lambda用エントリーポイント
exec /usr/local/bin/npx aws-lambda-ric src/index.handler
