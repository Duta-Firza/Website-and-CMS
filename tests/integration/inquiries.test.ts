import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/inquiries/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/inquiries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Andi Pertama",
  company: "PT Tester",
  email: "andi@example.com",
  phone: "08123456789",
  message: "Saya tertarik dengan solusi EPC anda.",
  source: "trading",
};

describe("POST /api/inquiries — payload validation", () => {
  afterEach(() => {
    // ensure no DB side-effects this route is supposed to perform (it's a stub)
  });

  it("accepts a valid payload", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("rejects missing required fields", async () => {
    const res = await POST(makeRequest({ ...validBody, message: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("rejects when honeypot field is filled (bot)", async () => {
    const res = await POST(makeRequest({ ...validBody, website: "http://spam.example.com" }));
    expect(res.status).toBe(400);
  });

  it("rejects unknown source values", async () => {
    const res = await POST(makeRequest({ ...validBody, source: "marketing" }));
    expect(res.status).toBe(400);
  });
});
