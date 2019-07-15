# OpenId Connect Server Mock

This project is the mock server that provides OpenId Connect functionality including Implicit Flow.

This is the sample of using the server in `docker-compose` configuration:

```yaml
  version: '3'
  services:
    oidc-server-mock:
      container_name: oidc-server-mock
      image: soluto/oidc-server-mock
      ports:
        - "4011:80"
      environment:
        ASPNETCORE_ENVIRONMENT: Development
        USERS_CONFIGURATION_INLINE: |
          [
            {
              "SubjectId":"1",
              "Username":"User1",
              "Password":"pwd"
            }
          ]
        CLIENTS_CONFIGURATION_PATH: /tmp/config/clients-config.json
      volumes:
        - .:/tmp/config:ro
```

When `clients-config.json` is as following:

```json
[{
        "ClientId": "implicit-mock-client",
        "Description": "Client for implicit flow",
        "AllowedGrantTypes": [
            "implicit"
        ],
        "AllowAccessTokensViaBrowser": true,
        "RedirectUris": [
            "http://localhost:3000/auth/oidc",
            "http://localhost:4004/auth/oidc"
        ],
        "AllowedScopes": [
            "openid",
            "profile",
            "email"
        ],
        "IdentityTokenLifetime": 3600,
        "AccessTokenLifetime": 3600
    },
    {
        "ClientId": "client-credentials-mock-client",
        "ClientSecrets": [
          "client-credentials-mock-client-secret"
        ],
        "Description": "Client for client credentials flow",
        "AllowedGrantTypes": [
            "client_credentials"
        ],
        "AllowedScopes": [
            "some-app"
        ]
    }
]
```

Clients configuration should be provided. Test user configuration is optional (used for implicit flow only).

There are two ways to provide configuration both to clients and users. You can either provide it inline as environment variable (`USERS_CONFIGURATION_INLINE` / `CLIENTS_CONFIGURATION_INLINE`) or mount volume and provide the path to configuration json as environment variable (`USERS_CONFIGURATION_PATH` / `CLIENTS_CONFIGURATION_PATH`).

