import { describe, it, expect } from "vitest";
import type { ConfigService } from "@nestjs/config";

import { AppService } from "./app.service";
import { NodeEnvironment } from "./config/environment";

const createConfigService = (values: Record<string, unknown>): ConfigService =>
  ({
    get: (key: string) => values[key],
  }) as ConfigService;

describe("AppService", () => {
  it("returns health information derived from config", () => {
    const config = createConfigService({
      NODE_ENV: NodeEnvironment.Test,
      DATABASE_URL: "postgres://localhost/db",
    });

    const service = new AppService(config);
    const health = service.getHealth();

    expect(health.environment).toBe(NodeEnvironment.Test);
    expect(health.database).toBe("configured");
    expect(health.status).toBe("ok");
  });

  it("builds an example user with timestamps", () => {
    const service = new AppService(createConfigService({}));

    const user = service.getExampleUser();

    expect(user).toMatchObject({
      id: "u_001",
      email: "example@example.com",
      name: "Example",
    });
    expect(Date.parse(user.createdAt)).toBeGreaterThan(0);
    expect(Date.parse(user.updatedAt)).toBeGreaterThan(0);
  });
});
