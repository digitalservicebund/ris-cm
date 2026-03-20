import { defineConfig, mergeConfig } from "vitest/config"
import viteConfig from "./vite.config"

export default defineConfig((context) =>
  mergeConfig(
    viteConfig(context),
    defineConfig({
      test: {
        setupFiles: ["src/vitest-setup.ts"],
        globals: true,
        environment: "jsdom",
        include: ["test/unit/**/*.spec.ts"],
        css: {
          // Needed so we can reliably test for class names for CSS modules.
          // Otherwise scoped CSS classes would have an unreliable hash
          // attached to the class name.
          modules: { classNameStrategy: "non-scoped" },
        },
        coverage: {
          provider: "istanbul",
          reporter: ["lcov"],
          // Changes to this also need to be reflected in the sonar-project.properties
          exclude: [
            // Configuration and generated outputs
            "**/[.]**",
            "coverage/**/*",
            "dist/**/*",
            "**/.*rc.{?(c|m)js,yml}",
            "*.config.{js,ts}",

            // Types
            "**/*.d.ts",

            // Tests
            "test/**/*",
            "src/vitest-setup.ts",

            // App content we're not interested in covering with unit tests. If you
            // add something here, please also add a comment explaining why the
            // exclusion is necessary.

            // If necessary to use e.g. guards, we'll have a router-guards file that
            // then should be tested
            "src/router.ts",

            // Just the init file and global setup, nothing much to test here.
            "src/main.ts",

            "src/scripts/getFavicon.ts",
            "src/stores/sessionStore.ts",
          ],
        },
      },
    }),
  ),
)
