import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateTransport = vi.hoisted(() => vi.fn());

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mockCreateTransport,
  },
}));

describe("transporter", () => {
  beforeEach(() => {
    vi.resetModules();
    mockCreateTransport.mockReset();

    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_PROVIDER_API_KEY;
  });

  it("configure Brevo par défaut via SMTP", async () => {
    await import("../transporter.js");

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: undefined,
        pass: undefined,
      },
    });
  });

  it("utilise SMTP_PASS ou EMAIL_PROVIDER_API_KEY comme secret SMTP", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_USER = "user@example.com";
    process.env.EMAIL_PROVIDER_API_KEY = "provider-secret";

    await import("../transporter.js");

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 465,
      secure: true,
      auth: {
        user: "user@example.com",
        pass: "provider-secret",
      },
    });
  });
});
