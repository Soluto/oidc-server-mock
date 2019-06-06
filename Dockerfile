###########
FROM microsoft/aspnetcore-build:2.0.5-2.1.4 as source
ARG target="Release"

WORKDIR /src
COPY ./OpenIdConnectServerMock.csproj ./OpenIdConnectServerMock.csproj
RUN dotnet restore

COPY . .

RUN dotnet publish -c $target -o obj/docker/publish

RUN cp -r /src/obj/docker/publish /OpenIdConnectServerMock

FROM microsoft/aspnetcore:2.0.5
ARG target="Release"

RUN if [ $target = "Debug" ]; then apt-get update && apt-get install unzip && rm -rf /var/lib/apt/lists/* && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg; fi

COPY --from=source /OpenIdConnectServerMock /OpenIdConnectServerMock
WORKDIR /OpenIdConnectServerMock

ENV ASPNETCORE_ENVIRONMENT=Development

# OpenId connect client
ENV OIDC_CLIENT_ID=openid-mock-client
ENV REDIRECT_URIS=http://localhost:3000/auth/oidc

# oauth2/client_credentials client
ENV CLIENT_CREDENTIALS_CLIENT_ID=client-credentials-mock-client
ENV CLIENT_CREDENTIALS_CLIENT_SECRET="client-credentials-mock-client-secret"
ENV API_RESOURCE="some-app"

ENV TEST_USER="{\"SubjectId\":\"1\",\"Username\":\"User1\",\"Password\":\"pwd\"}"

EXPOSE 80

HEALTHCHECK --interval=60s --timeout=2s --retries=8 \
      CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "OpenIdConnectServerMock.dll" ]