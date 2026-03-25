# 4. Mount a file with environment specific configuration into the docker container

Date: 2026-03-25

## Status

Accepted

## Context

We have a web-app that is build into a static website using vite and then put into a minimal nginx-docker image and
deployed as a k8s-pod. We want to use the same docker image on all environments but need some environment specific
configuration (e.g. for the oauth-flow).

## Decision

We will add a config file called `env.json` to our docker container. This config file will be loaded by the frontend.

In the individual deployments for the different environments we will overwrite this file with a file containing the
configuration for that environment.

## Consequences

We can keep a docker image that is minimal and the same for all environments and also adjust the configuration for every
environment. We can even do this without needing to redeploy the image.
