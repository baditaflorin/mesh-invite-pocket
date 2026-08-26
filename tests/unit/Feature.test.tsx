import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createMockRoom } from "@baditaflorin/mesh-common/testing";
import { Feature } from "../../src/Feature";
import { config } from "../../src/config";

describe("Feature (component)", () => {
  it("renders the private invitation entry point when connected", () => {
    const room = createMockRoom();
    render(<Feature room={room} config={config} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Issue a private invitation." }),
    ).toBeInTheDocument();
    expect(screen.getByText("This is a room ledger, not a public inbox.")).toBeInTheDocument();
  });

  it("shows a connecting state when room is null", () => {
    render(<Feature room={null} config={config} />);
    // Most templates show "Connecting…" while the room is null. Apps with a
    // custom waiting state can override this test.
    const heading = screen.getAllByRole("heading", { level: 1 })[0];
    expect(heading).toBeInTheDocument();
  });

  it("offers a named, labelled invitation composer", () => {
    render(<Feature room={createMockRoom()} config={config} />);
    expect(screen.getByRole("button", { name: "Create invitation" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your display name")).toBeInTheDocument();
    expect(screen.getByLabelText("Invitation purpose")).toBeInTheDocument();
  });

  it("creates a room-scoped invitation from the working composer", () => {
    render(<Feature room={createMockRoom({ peerId: "avery" })} config={config} />);

    fireEvent.change(screen.getByLabelText("Invitation purpose"), {
      target: { value: "Boardroom access" },
    });
    fireEvent.change(screen.getByLabelText(/One-time code/i), {
      target: { value: "desk-2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create invitation" }));

    expect(screen.getByText("Boardroom access")).toBeInTheDocument();
    expect(screen.getByText("DESK-2026")).toBeInTheDocument();
    expect(screen.getByText("Open to claim")).toBeInTheDocument();
  });
});
