# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:7.0 as source
ARG target="Release"

RUN apt-get update && apt-get install unzip -y

WORKDIR /src

RUN curl -L https://raw.githubusercontent.com/DuendeSoftware/IdentityServer.Quickstart.UI/main/getmain.sh | bash

COPY ./OpenIdConnectServerMock.csproj ./OpenIdConnectServerMock.csproj
RUN dotnet restore

COPY . .

RUN dotnet publish -c $target -o obj/docker/publish

RUN cp -r /src/obj/docker/publish /OpenIdConnectServerMock

# Stage 2: Release
FROM mcr.microsoft.com/dotnet/aspnet:7.0 as release
ARG target="Release"

RUN apt-get update && apt-get install curl -y && rm -rf /var/lib/apt/lists/*
RUN if [ $target = "Debug" ]; then apt-get install unzip && rm -rf /var/lib/apt/lists/* && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg; fi

COPY --from=source /OpenIdConnectServerMock /OpenIdConnectServerMock
WORKDIR /OpenIdConnectServerMock

ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 80

HEALTHCHECK --start-period=2s --interval=1s --timeout=100ms --retries=10 \
      CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "OpenIdConnectServerMock.dll" ]
