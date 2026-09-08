import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("nunca guarda la contraseña en texto plano", async () => {
    const hash = await hashPassword("MiPassword123");
    expect(hash).not.toBe("MiPassword123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifyPassword acepta la contraseña correcta y rechaza una incorrecta", async () => {
    const hash = await hashPassword("MiPassword123");
    expect(await verifyPassword("MiPassword123", hash)).toBe(true);
    expect(await verifyPassword("OtraCosa123", hash)).toBe(false);
  });
});
