# OpenId Connect Server Mock

![Run Tests badge](https://github.com/Soluto/oidc-server-mock/workflows/Run%20Tests/badge.svg)

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
        SERVER_OPTIONS_INLINE: |
          {
            "AccessTokenJwtType": "JWT",
            "Discovery": {
              "ShowKeySet": true
            }
          }
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

There are two ways to provide configuration for supported scopes, clients and users. You can either provide it inline as environment variable:

* `SERVER_OPTIONS_INLINE`
* `API_SCOPES_INLINE`
* `USERS_CONFIGURATION_INLINE`
* `CLIENTS_CONFIGURATION_INLINE`
* `API_RESOURCES_INLINE`
* `IDENTITY_RESOURCES_INLINE`

   or mount volume and provide the path to configuration json as environment variable:

* `SERVER_OPTIONS_PATH`
* `API_SCOPES_PATH`
* `USERS_CONFIGURATION_PATH`
* `CLIENTS_CONFIGURATION_PATH`
* `API_RESOURCES_PATH`
* `IDENTITY_RESOURCES_PATH`

## Contributing

### Requirements

1. [Docker](https://www.docker.com/) (version 18.09 or higher)

2. [NodeJS](https://nodejs.org/en/) (version 10.0.0 or higher)

### Getting started

1. Clone the repo:

      ```sh
      git clone git@github.com:Soluto/oidc-server-mock.git
      ```

2. Install `npm` packages (run from `/e2e` folder):

    ```sh
    npm install
    ```

    > Note: During the build of Docker image UI source code is fetched from [github](https://github.com/IdentityServer/IdentityServer4.Quickstart.UI/tree/main). If you experience some issues on project compile step of Docker build or on runtime try to change the branch or commit in the [script](./src/getmain.sh).

3. Run tests:

    ```sh
    npm run test
    ```

## Used by

1. [Tweek](https://github.com/Soluto/tweek) blackbox [tests](https://github.com/Soluto/tweek-blackbox).

2. [Stitch](https://github.com/Soluto/Stitch) e2e tests.
