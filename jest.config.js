/** @type {import('jest').Config} */
const config = {
  verbose: true,
  collectCoverageFrom: ['src/*.ts', 'src/*.js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
}

export default config
