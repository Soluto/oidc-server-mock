docker_compose('./e2e/docker-compose.yml')

docker_build('oidc-server-mock', './src')

dc_resource('oidc-server-mock')
local_resource('tests', cmd='npm run test --workspace=e2e', resource_deps=['oidc-server-mock'])
