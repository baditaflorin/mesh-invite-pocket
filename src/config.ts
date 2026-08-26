import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-invite-pocket",
  displayName: "Private Invite Desk",
  visualProfile: "utility",
  shellLayout: "inset",
  description: "Create and claim room-scoped, one-time invitations directly between peers.",
  accentHex: "#7ea5ff",
  version: "0.1.0",
  commit: "main",
});
