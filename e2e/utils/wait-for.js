const waitOn = require('wait-on');

async function waitForIt(resources, reverse = false, timeout = 10000) {
  await waitOn({
    resources,
    timeout,
    reverse,
    interval: 100,
    simultaneous: 1,
  });
}

const resources = [
  'http-get://localhost:8080',
];

module.exports.start = waitForIt.bind(undefined, resources, false);
module.exports.stop = waitForIt.bind(undefined, resources, true);
