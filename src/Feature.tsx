import { useState } from "react";
import { useSharedInvites, type MeshConfig, type YRoom } from "@baditaflorin/mesh-common";

type Props = { room: YRoom | null; config: MeshConfig };

export function Feature({ room, config }: Props) {
  const shared = useSharedInvites(room);
  const [label, setLabel] = useState("Welcome pass");
  const [code, setCode] = useState("");
  const create = () => {
    if (shared.create(label, code || undefined)) {
      setLabel("");
      setCode("");
    }
  };

  return (
    <main className="feature">
      <header>
        <p className="eyebrow">Room-scoped codes</p>
        <h1>{config.appName}</h1>
        <p>Make a one-time code, then let a peer claim it directly in this room.</p>
      </header>
      <section className="composer" aria-label="Create invitation">
        <label>
          Invite label
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Guest or purpose"
          />
        </label>
        <label>
          Custom code <small>(optional)</small>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="MESH-123"
          />
        </label>
        <button type="button" onClick={create}>
          Create code
        </button>
      </section>
      <p className="feature-status" role="status">
        {room ? `${shared.open.length} open · ${room.peerCount} peer(s)` : "Connecting…"}
      </p>
      <section className="invites" aria-live="polite">
        {shared.invites.length === 0 ? (
          <p className="empty">No codes yet. Make the first one.</p>
        ) : (
          shared.invites.map((invite) => {
            const mine = invite.createdBy === room?.peerId;
            const claimedByMe = invite.acceptedBy === room?.peerId;
            return (
              <article className="invite" key={invite.code}>
                <div>
                  <strong>{invite.label}</strong>
                  <code>{invite.code}</code>
                </div>
                <span>
                  {invite.acceptedBy
                    ? `Claimed by ${claimedByMe ? "you" : "a peer"}`
                    : "Open to claim"}
                </span>
                <div className="actions">
                  {!invite.acceptedBy && (
                    <button type="button" onClick={() => shared.accept(invite.code)}>
                      Claim
                    </button>
                  )}
                  {claimedByMe && (
                    <button type="button" onClick={() => shared.release(invite.code)}>
                      Release
                    </button>
                  )}
                  {mine && (
                    <button type="button" onClick={() => shared.revoke(invite.code)}>
                      Revoke
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
