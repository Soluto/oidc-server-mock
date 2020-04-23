# OpenId Connect Server Mock

[![CircleCI](https://circleci.com/gh/Soluto/oidc-server-mock.svg?style=svg)](https://circleci.com/gh/Soluto/oidc-server-mock)

This project allows you to run configurable mock server with OpenId Connect functionality.

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
        API_SCOPES_INLINE: |
          [
            "some-app-scope-1",
            "some-app-scope-2"
          ]
        API_RESOURCES_INLINE: |
          [
            {
              "Name": "some-app",
              "Scopes": ["some-app-scope-1", "some-app-scope-2"]
            }
          ]
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
        ],
        "ClientClaimsPrefix": "",
        "Claims": [
            {
                "Type": "string_claim",
                "Value": "string_claim_value"
            },
            {
                "Type": "json_claim",
                "Value": "['value1', 'value2']",
                "ValueType": "json"
            }
        ]

    }
]
```

Clients configuration should be provided. Test user configuration is optional (used for implicit flow only).

There are two ways to provide configuration for supported scopes, clients and users. You can either provide it inline as environment variable (`USERS_CONFIGURATION_INLINE` / `CLIENTS_CONFIGURATION_INLINE` / `API_RESOURCES_INLINE`) or mount volume and provide the path to configuration json as environment variable (`USERS_CONFIGURATION_PATH` / `CLIENTS_CONFIGURATION_PATH` / `API_RESOURCES_PATH`).

