FROM node:21.1.0-slim@sha256:cba276a6db06f49c589bcea35c598b5a960880ed5631bd4407a61c414ec7a9b9 AS base

ENV ROOT_PATH=/cloud-run-jobs-emulator
WORKDIR ${ROOT_PATH}

# ---

FROM base AS dependencies
COPY --chown=node:node ./package*.json ${ROOT_PATH}/
RUN npm install

# ---

FROM base as build
COPY --from=dependencies ${ROOT_PATH}/ ${ROOT_PATH}/
COPY --chown=node:node ./.swcrc ${ROOT_PATH}/
COPY --chown=node:node ./src/ ${ROOT_PATH}/src/
RUN npm run build

# ---

FROM base as runtime-dev
RUN apt-get update -y && \
    apt-get install -y procps
COPY --from=build ${ROOT_PATH}/ ${ROOT_PATH}/
ENTRYPOINT [ "npm" ]
CMD [ "run", "dev" ]

# ---

FROM base as runtime
COPY --from=build ${ROOT_PATH} ${ROOT_PATH}
