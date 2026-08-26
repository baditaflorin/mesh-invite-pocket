import { useRef, useState } from "react";
import {
  MeshButton,
  MeshLaunch,
  MeshNameInput,
  MeshPresence,
  MeshStatusPill,
  MeshSurface,
  useNamedPeer,
  useSharedInvites,
  type MeshConfig,
  type SharedInvite,
  type YRoom,
} from "@baditaflorin/mesh-common";

type Props = { room: YRoom | null; config: MeshConfig };

function peerLabel(
  peerId: string,
  room: YRoom | null,
  nameOf: (id: string) => string | undefined,
): string {
  if (peerId === room?.peerId) return "you";
  return nameOf(peerId)?.trim() || "a room member";
}

function inviteStatus(
  invite: SharedInvite,
  room: YRoom | null,
  nameOf: (id: string) => string | undefined,
) {
  if (!invite.acceptedBy) {
    return { tone: "live" as const, label: "Open to claim" };
  }

  return {
    tone: "success" as const,
    label: `Claimed by ${peerLabel(invite.acceptedBy, room, nameOf)}`,
  };
}

export function Feature({ room, config }: Props) {
  const shared = useSharedInvites(room);
  const namedPeer = useNamedPeer(config, room);
  const labelRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("Guest access");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const connectedDevices = room ? room.peerCount + 1 : 0;

  const create = () => {
    const createdCode = shared.create(label, code || undefined);
    if (createdCode) {
      setLabel("");
      setCode("");
      setNotice(`Invitation ${createdCode} is now available to this room.`);
      return;
    }
    setNotice(
      room
        ? "Choose a unique code and a short invitation purpose."
        : "The private room is still connecting. Try again in a moment.",
    );
  };

  return (
    <main className="invite-pocket">
      <div className="invite-workspace">
        <MeshLaunch
          className="invite-launch"
          eyebrow="Private exchange"
          heading="Issue a private invitation."
          promise="Create one room-scoped code. A person already in this room can claim it, and the handoff closes there."
          presence={
            <MeshPresence
              count={connectedDevices}
              label="devices in this room"
              state={room ? "connected" : "connecting"}
              announce="polite"
            />
          }
          preview={
            <ol className="invite-flow" aria-label="How an invitation moves through the room">
              <li>
                <span>01</span>
                <strong>Create</strong>
                <small>Set a purpose and one-time code.</small>
              </li>
              <li>
                <span>02</span>
                <strong>Share room</strong>
                <small>Invite a person with the room link.</small>
              </li>
              <li>
                <span>03</span>
                <strong>Claim</strong>
                <small>The invitation closes after a claim.</small>
              </li>
            </ol>
          }
          primaryAction={{
            label: "Create an invitation",
            onClick: () => labelRef.current?.focus(),
            "aria-controls": "invite-composer",
          }}
          secondaryAction={{
            label: "Privacy boundary",
            onClick: () => document.getElementById("privacy-boundary")?.focus(),
            "aria-controls": "privacy-boundary",
          }}
          loading={!room}
          connectionHint={
            room ? "This room is ready for direct peer exchange." : "Preparing a direct peer room…"
          }
        />

        <MeshSurface
          as="section"
          tone="raised"
          padding="lg"
          className="invite-composer"
          aria-labelledby="create-invitation-heading"
          id="invite-composer"
        >
          <header className="surface-heading">
            <div>
              <p className="section-kicker">Create</p>
              <h2 id="create-invitation-heading">New invitation</h2>
            </div>
            <MeshStatusPill tone={room ? "live" : "warning"} dot>
              {room ? "Room ready" : "Connecting"}
            </MeshStatusPill>
          </header>

          <form
            className="invite-form"
            onSubmit={(event) => {
              event.preventDefault();
              create();
            }}
          >
            <MeshNameInput
              value={namedPeer.name}
              onChange={namedPeer.setName}
              label="Your display name"
              placeholder="How should this room know you?"
              maxLength={48}
              showCounter
              hint="Shared only with people in this room."
            />
            <label className="invite-field" htmlFor="invite-label">
              <span>Invitation purpose</span>
              <input
                ref={labelRef}
                id="invite-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Guest access"
                maxLength={120}
                autoComplete="off"
              />
            </label>
            <label className="invite-field" htmlFor="invite-code">
              <span>
                One-time code <small>optional</small>
              </span>
              <input
                id="invite-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="MESH-123"
                maxLength={32}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <MeshButton
              type="submit"
              fullWidth
              size="lg"
              disabled={!room || !label.trim()}
              data-testid="create-invitation"
            >
              Create invitation
            </MeshButton>
          </form>
          <p className="invite-notice" role="status" aria-live="polite">
            {notice || "A claimed invitation cannot be claimed again."}
          </p>
        </MeshSurface>
      </div>

      <div className="invite-ledger-grid">
        <MeshSurface
          as="section"
          tone="base"
          padding="lg"
          className="invite-ledger"
          aria-labelledby="room-ledger-heading"
        >
          <header className="surface-heading">
            <div>
              <p className="section-kicker">Room ledger</p>
              <h2 id="room-ledger-heading">Available invitations</h2>
            </div>
            <MeshStatusPill tone={shared.open.length ? "live" : "neutral"} dot>
              {shared.open.length} open
            </MeshStatusPill>
          </header>

          <div className="invite-list" aria-live="polite">
            {shared.invites.length === 0 ? (
              <div className="invite-empty">
                <strong>The room is clear.</strong>
                <p>Create the first invitation when you are ready to hand something off.</p>
              </div>
            ) : (
              shared.invites.map((invite) => {
                const mine = invite.createdBy === room?.peerId;
                const claimedByMe = invite.acceptedBy === room?.peerId;
                const status = inviteStatus(invite, room, namedPeer.nameOf);

                return (
                  <article className="invite-record" key={invite.code}>
                    <div className="invite-record-main">
                      <p className="invite-record-label">{invite.label}</p>
                      <code>{invite.code}</code>
                      <p className="invite-record-meta">
                        Created by {peerLabel(invite.createdBy, room, namedPeer.nameOf)}
                      </p>
                    </div>
                    <div className="invite-record-actions">
                      <MeshStatusPill tone={status.tone} dot>
                        {status.label}
                      </MeshStatusPill>
                      <div className="record-controls">
                        {!invite.acceptedBy && (
                          <MeshButton
                            variant="primary"
                            size="sm"
                            onClick={() => shared.accept(invite.code)}
                          >
                            Claim invitation
                          </MeshButton>
                        )}
                        {claimedByMe && (
                          <MeshButton
                            variant="secondary"
                            size="sm"
                            onClick={() => shared.release(invite.code)}
                          >
                            Release claim
                          </MeshButton>
                        )}
                        {mine && (
                          <MeshButton
                            variant="quiet"
                            size="sm"
                            onClick={() => shared.revoke(invite.code)}
                          >
                            Revoke invitation
                          </MeshButton>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </MeshSurface>

        <MeshSurface
          as="aside"
          tone="quiet"
          padding="lg"
          className="privacy-boundary"
          id="privacy-boundary"
          tabIndex={-1}
          aria-labelledby="privacy-boundary-heading"
        >
          <p className="section-kicker">Privacy boundary</p>
          <h2 id="privacy-boundary-heading">This is a room ledger, not a public inbox.</h2>
          <p>
            Invitation labels, codes, claims, and display names are visible only to people who join
            this room. They are not published as public links or account records.
          </p>
          <p>
            Direct peer exchange uses WebRTC. The room ID and your local settings stay in this
            browser unless you choose to share the room invite.
          </p>
        </MeshSurface>
      </div>
    </main>
  );
}
