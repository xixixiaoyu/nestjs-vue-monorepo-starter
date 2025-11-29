import { withVitestBaseConfig } from "../../packages/vitest-config/base";

export default withVitestBaseConfig({
  test: {
    environment: "node",
  },
});
