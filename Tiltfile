dockerComps = ['./e2e/docker-compose.yml']

imageTag = os.getenv('IMAGE_TAG', '')
if imageTag == '':
    docker_build('oidc-server-mock', './src')
else:
    dockerComps.append( './e2e/docker-compose.override.yml')

docker_compose(dockerComps)

dc_resource('oidc-server-mock')
local_resource('tests', cmd='npm run test --workspace=e2e', resource_deps=['oidc-server-mock'])
