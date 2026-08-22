export default async (a, b) => {
  await a.getByLabel(/Invite label/i).fill("Workshop guest");
  await a.getByLabel(/Custom code/i).fill("MESH-2026");
  await a.getByRole("button", { name: "Create code" }).click();
  await b.waitForTimeout(1200);
  await b.getByRole("button", { name: "Claim" }).click();
  await a.waitForTimeout(1600);
};
