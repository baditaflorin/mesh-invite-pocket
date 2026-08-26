# Private Invite Desk

**Live → https://baditaflorin.github.io/mesh-invite-pocket/**

Private Invite Desk is a room-scoped, one-time invitation ledger for a small
group that already shares a Mesh room. Create an invitation, optionally choose
its code, and let one connected peer claim it directly. A claim can be released
by its holder, while the creator can revoke the invitation.

The app is intentionally not a public invite-link service. The toolbar's room
Invite control is the only thing you share externally; invitation purposes,
codes, claims, and display names stay visible only to people who have joined
that room. There are no accounts and no application backend.

## Run locally

Clone this repository beside `mesh-common`, then run `npm ci` and `npm run dev`.
The service has no account or app backend. See [the privacy boundary](docs/privacy.md)
for the room-data model.

## Verify

`npm run fmt:check`, `npm run typecheck`, `npm run test:unit`, and `npm run smoke`
cover the local release gate. `npm run test:e2e` includes a real two-peer
create-and-claim flow plus 390×844 no-overflow/action-visible and 1141×602
above-fold checks. Run `npm run test:leak` for the opt-in room lifecycle probe.

GitHub Pages publishes the committed `docs/` directory from `main`.
