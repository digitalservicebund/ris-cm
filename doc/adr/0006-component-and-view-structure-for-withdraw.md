# 6. Component and view structure for withdraw

Date: 2026-06-01

## Status

Accepted

## Context

We need to support a withdraw functionality for different types of documents.
To keep the code simple, maintainable, and extendable, we want to keep duplicated logic to a minimum while also
supporting the differences between the document types.

## Decision

We will have document-type-specific views.
We will use shared composables and components for the abstract logic and create a document-type-specific library file
and component for the result list.

## Consequences

For every document type the following files exist:

- `src/components/ResultList{DocumentType}.vue`
  - Vue component showing a table with the search results and the buttons for opening it in the portal and withdrawing
    the document
- `src/lib/{documentType}.ts`
  - Library file responsible for communicating with the portal API and doc-type-specific backend.
  - It exports:
    - `function search(documentNumber: string): Promise<DocumentTypeSearchResult[]>` Searches both the doc-type-specific
      backend and the portal API for the document number and returns the result. If the portal API finds the document,
      the property `visibleInPortal` should be `true`.
    - `function withdraw(documentNumber: string): Promise<WithdrawResult>` Calls the withdraw endpoint of the
      doc-type-specific backend. It should not throw in case of an error but instead return a `WithdrawResult` with
      `status: "ERROR"`.
    - The type definition for the document-type search result.
- `src/views/Withdraw{DocumentType}.vue`
  - View showing the search and search results.
- `src/views/Withdraw{DocumentType}Result.vue`
  - View showing the withdrawal result.

The following files include more document-type-specific configuration:

- `public/config/env.json`, `src/lib/env.ts`
  - Configures the search and withdraw URLs for the document type. This also needs to be adjusted in the infra-repo.
- `src/router.ts`
  - Routes for the views (`zurueckziehen/{dokument-art}` and `zurueckziehen/{dokument-art}/ergebnis`)
