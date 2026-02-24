#!/usr/bin/env sh
set -euo pipefail

IMAGE_NAME=${IMAGE_NAME:-invoice-processing}
IMAGE_TAG=${IMAGE_TAG:-latest}
PORT=${PORT:-8080}

printf "Building Docker image %s:%s...\n" "$IMAGE_NAME" "$IMAGE_TAG"
docker build -t "$IMAGE_NAME:$IMAGE_TAG" .

printf "Starting container on port %s...\n" "$PORT"
docker run --rm -p "$PORT":80 "$IMAGE_NAME:$IMAGE_TAG"