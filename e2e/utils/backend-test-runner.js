const DefaultJestRunner = require('jest-runner');
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

const upAdditionalOptions = {
  commandOptions: ['--force-recreate', '--remove-orphans', '--renew-anon-volumes'],
};

const downAdditionalOptions = {
  commandOptions: ['--volumes', '--remove-orphans'],
};

class BackendJestRunner extends DefaultJestRunner {
  constructor(config, context) {
    super(config, context);
    this.isSerial = true;
  }

  async setup() {
    await dockerCompose.buildAll(options);
    await dockerCompose.upAll({ ...options, ...upAdditionalOptions });

    await waitFor.start(30000);
  }

  async teardown() {
    // await dockerCompose.logs(['oidc-server-mock'], options);
    await dockerCompose.down({ ...options, ...downAdditionalOptions });
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

module.exports = BackendJestRunner;
