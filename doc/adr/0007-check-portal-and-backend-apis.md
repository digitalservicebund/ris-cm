# 7. Check portal and backend APIs

Date: 2026-06-02

## Status

Accepted

## Context

We need to know if a document is currently published to provide information on whether withdrawing it is necessary.

If a document is available in the publication bucket it is available on the portal and can be loaded using the portal
API.
The document is also stored in the database for the respective document-type. This database also contains information
about the publication status of the document.

The publication status in the database could be PUBLISHED even if the document is not in the bucket. E.g. if the
document was manually deleted from the bucket. In this case a newly added reference to this document could trigger
publishing this document to the bucket.

The document could be in the bucket, even though it is not in the database. This could be the case if it was manually
deleted from the database.

## Decision

When searching for a document we:

1. check the portal API to see if the document is currently published, since checking only the backend could yield
   incorrect information.
2. also check the document-type-specific backend to get information about withdrawn or unpublished documents.

## Consequences

This introduces a dependency on the portal API.
