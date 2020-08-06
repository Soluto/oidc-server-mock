const PlaywrightRunner = require('jest-playwright-preset/lib/PlaywrightRunner').default;
const dockerCompose = require('docker-compose');
const waitFor = require('./wait-for');

const options = {
  cwd: __dirname,
  env: {
    COMPOSE_DOCKER_CLI_BUILD: '1',
    DOCKER_BUILDKIT: '1',
    PATH: process.env.PATH,
  },
  log: true,
};

class FrontendJestRunner extends PlaywrightRunner {
  constructor(config, context) {
    super(config, context);
    this.isSerial = true;
  }

  async setup() {
    await dockerCompose.buildAll(options);
    await dockerCompose.upAll(options);

    await waitFor.start(30000);
  }

  async teardown() {
    // await dockerCompose.logs(['oidc-server-mock'], options);
    await dockerCompose.down(options);
    await waitFor.stop(30000);
  }

  async runTests(tests, watcher, onStart, onResult, onFailure, options) {
    try {
      await this.setup();
      await super.runTests(tests, watcher, onStart, onResult, onFailure, options);
    } finally {
      await this.teardown();
    }
  }
}

module.exports = FrontendJestRunner;
