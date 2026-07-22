# 8. Use eager route loading

Date: 2026-07-21

## Status

Accepted

## Context

With lazy loading in our router, we sometimes got "error loading dynamically imported module" exceptions. As we do not
keep old bundle versions, lazy loading fails if between opening the app and then navigating to a new route for the first
time a new deployment happens. Then the route bundle you wanted to fetch gets redeployed with a new hash, so the old app
version does not exist anymore.

As the cm app is very small, we do not need to optimize the initial bundle size.

## Decision

We use eager loading for all routes in the router instead
of [lazy loading](https://router.vuejs.org/guide/advanced/lazy-loading.html).

## Consequences

The initial bundle size will be slightly bigger, but we avoid the errors without any implementation effort.
