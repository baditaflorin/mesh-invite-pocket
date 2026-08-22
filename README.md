# Invite Pocket

**Live → https://baditaflorin.github.io/mesh-invite-pocket/**

Invite Pocket creates room-scoped, one-time invitation codes. A code can be
claimed and released directly among connected peers; it does not create an
external link, account, or backend record.

## Run locally

Clone this repository beside `mesh-common`, then run `npm install` and `npm run dev`.
The service has no account or app backend. See `docs/privacy.md` after building
for the room-data model.

## Verify

`npm run fmt:check`, `npm run typecheck`, `npm run test:unit`, and `npm run smoke`.

GitHub Pages publishes the committed `docs/` directory from `main`.
