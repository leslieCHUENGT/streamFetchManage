module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testMatch: ["**/test/**/*.test.ts"],
  moduleNameMapper: {
    "@microsoft/fetch-event-source":
      "<rootDir>/test/__mocks__/fetchEventSource.ts",
  },
};
