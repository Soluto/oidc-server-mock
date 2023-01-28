import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  projects: [
    {
      displayName: 'Backend Tests',
      preset: 'ts-jest',
      rootDir: '.',
      snapshotSerializers: ['<rootDir>/utils/jwt-serializer.js', '<rootDir>/utils/jwt-payload-serializer.js'],
      testMatch: ['<rootDir>/tests/**/*.spec.ts'],
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/tests/*.e2e-spec.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'Frontend Tests',
      preset: 'jest-playwright-preset',
      rootDir: '.',
      snapshotSerializers: ['<rootDir>/utils/jwt-serializer.js', '<rootDir>/utils/jwt-payload-serializer.js'],
      testMatch: ['<rootDir>/tests/**/*.e2e-spec.ts'],
      testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      testEnvironment: 'node',
    },
  ],
  testTimeout: 60000,
};

export default config;
