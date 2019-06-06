# OpenId Connect Server Mock

This project is the mock server that provides OpenId Connect functionality including Implicit Flow.

This is the sample of using the server in `docker-compose` configuration:

```yaml
  oidc-server-mock:
    container_name: oidc-server-mock
    image: soluto/oidc-server-mock
    ports:
      - "4011:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      # Configuration for OpenId Connect scenario
      - OIDC_CLIENT_ID=tweek-openid-mock-client
      - REDIRECT_URIS=http://localhost:3000/auth/oidc,http://localhost:4004/auth/oidc
      - TEST_USER={"SubjectId":"1","Username":"User1","Password":"pwd"}
      # Configuration for Client Credentials scenario
      - CLIENT_CREDENTIALS_CLIENT_ID=client-credentials-mock-client
      - CLIENT_CREDENTIALS_CLIENT_SECRET="client-credentials-mock-client-secret"
      - API_RESOURCE="some-app"
```
