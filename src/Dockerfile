# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:3.1.411 as source
ARG target="Release"

RUN apt-get update && apt-get install unzip

WORKDIR /src

COPY ./getmain.sh ./getmain.sh
RUN ./getmain.sh

COPY ./OpenIdConnectServerMock.csproj ./OpenIdConnectServerMock.csproj
RUN dotnet restore

COPY . .

RUN dotnet publish -c $target -o obj/docker/publish

RUN cp -r /src/obj/docker/publish /OpenIdConnectServerMock

# Stage 2: Release
FROM mcr.microsoft.com/dotnet/aspnet:3.1.17 as release
ARG target="Release"

RUN if [ $target = "Debug" ]; then apt-get update && apt-get install unzip && rm -rf /var/lib/apt/lists/* && curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /vsdbg; fi

COPY --from=source /OpenIdConnectServerMock /OpenIdConnectServerMock
WORKDIR /OpenIdConnectServerMock

ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 80

HEALTHCHECK --interval=60s --timeout=2s --retries=8 \
      CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "OpenIdConnectServerMock.dll" ]