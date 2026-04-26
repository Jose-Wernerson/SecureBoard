import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  setupFiles: ["<rootDir>/tests/setup-env.cjs"],
  globalSetup: "<rootDir>/tests/global-setup.mjs",
  maxWorkers: 1,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
};

export default config;