#!/usr/bin/env just --justfile

set dotenv-load := false
set positional-arguments := true

toolchain := "docker"

docker-bin  := `which docker ||:`
docker-args := ""
docker      := docker-bin + " " + docker-args

docker-image-name := "ghcr.io/kurtschwarz/cloud-run-jobs-emulator"
docker-image-tag  := "latest"

env-check:
  #!/usr/bin/env bash
  set -euo pipefail

  for _tool in {{toolchain}} ; do
    command -v ${_tool} >/dev/null 2>&1 || {
      echo >&2 "env-check: ${_tool} is required but not installed. Please install using brew install ${_tool}. Exiting."
      exit 1
    }
  done

build: (env-check)
  #!/usr/bin/env bash
  set -euo pipefail

  {{docker}} buildx build \
    --platform linux/arm64 \
    --output=type=docker \
    --target=runtime-dev \
    --tag {{docker-image-name}}:dev \
      .

dev *FLAGS: (env-check)
  #!/usr/bin/env bash
  set -euo pipefail

  if [[ "{{FLAGS}}" =~ "--build" ]] ; then
    just build
  fi

  {{docker}} run -it \
    --env SHELL=/bin/sh \
    --env CHOKIDAR_USEPOLLING=true \
    --volume ./src:/cloud-run-jobs-emulator/src/ \
    --volume ./example/cloud-run-jobs-config.yaml:/cloud-run-jobs-config.yaml \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --publish 8123:8123 \
    {{docker-image-name}}:dev
