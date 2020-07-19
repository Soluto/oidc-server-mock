import waitOn = require('wait-on');

before('waiting for oidc server & airbag', async function () {
  this.timeout(10000);
  await waitOn({
    resources: [`tcp:oidc-server-mock:80`],
    // tslint:disable-next-line:object-literal-sort-keys
    delay: 1000,
    interval: 100,
    timeout: 60000,
    window: 1000,
  });
});
