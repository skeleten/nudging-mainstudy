#!/usr/bin/env /usr/bin/bash

npm run build
docker build --tag k7a_nudging:latest --no-cache .
