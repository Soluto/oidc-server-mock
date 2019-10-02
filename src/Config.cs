using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Test;
using Newtonsoft.Json;
using OpenIdConnectServer.Utils;

namespace OpenIdConnectServer
{
    public static class Config
    {
        public static IEnumerable<ApiResource> GetApiResources()
        {
            string apiResourcesStr = Environment.GetEnvironmentVariable("API_RESOURCES_INLINE");
            if (string.IsNullOrWhiteSpace(apiResourcesStr))
            {
                var apiResourcesFilePath = Environment.GetEnvironmentVariable("API_RESOURCES_PATH");
                if (string.IsNullOrWhiteSpace(apiResourcesFilePath))
                {
                    return new List<ApiResource>();
                }
                apiResourcesStr = File.ReadAllText(apiResourcesFilePath);
            }
            var apiResourceNames = JsonConvert.DeserializeObject<string[]>(apiResourcesStr);
            return apiResourceNames.Select(r => new ApiResource(r));
        }

        public static IEnumerable<Client> GetClients()
        {
            string configStr = Environment.GetEnvironmentVariable("CLIENTS_CONFIGURATION_INLINE");
            if (string.IsNullOrWhiteSpace(configStr))
            {
                var configFilePath = Environment.GetEnvironmentVariable("CLIENTS_CONFIGURATION_PATH");
                if (string.IsNullOrWhiteSpace(configFilePath))
                {
                    throw new ArgumentNullException("You must set either CLIENTS_CONFIGURATION_INLINE or CLIENTS_CONFIGURATION_PATH env variable");
                }
                configStr = File.ReadAllText(configFilePath);
            }
            var configClients = JsonConvert.DeserializeObject<IEnumerable<Client>>(configStr, new SecretConverter(), new ClaimJsonConverter());
            return configClients;
        }

        public static IEnumerable<IdentityResource> GetIdentityResources()
        {
            var standardResources = new List<IdentityResource>
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Profile(),
                new IdentityResources.Email()
            };
            return standardResources.Union(GetCustomIdentityResources());
        }

        public static List<TestUser> GetUsers()
        {
            string configStr = Environment.GetEnvironmentVariable("USERS_CONFIGURATION_INLINE");
            if (string.IsNullOrWhiteSpace(configStr))
            {
                var configFilePath = Environment.GetEnvironmentVariable("USERS_CONFIGURATION_PATH");
                if (string.IsNullOrWhiteSpace(configFilePath))
                {
                    return new List<TestUser>();
                }
                configStr = File.ReadAllText(configFilePath);
            }
            var configUsers = JsonConvert.DeserializeObject<List<TestUser>>(configStr, new ClaimJsonConverter());
            return configUsers;
        }

        private static IEnumerable<IdentityResource> GetCustomIdentityResources()
        {
            string identityResourcesStr = Environment.GetEnvironmentVariable("IDENTITY_RESOURCES_INLINE");
            if (string.IsNullOrWhiteSpace(identityResourcesStr))
            {
                var identityResourcesFilePath = Environment.GetEnvironmentVariable("IDENTITY_RESOURCES_PATH");
                if (string.IsNullOrWhiteSpace(identityResourcesFilePath))
                {
                    return new List<IdentityResource>();
                }
                identityResourcesStr = File.ReadAllText(identityResourcesFilePath);
            }

            var identityResourceConifgs = JsonConvert.DeserializeObject<IdentityResourceConfig[]>(identityResourcesStr);
            return identityResourceConifgs.Select(c => new IdentityResource(c.Name, c.ClaimTypes));
        }

        private class IdentityResourceConfig
        {
            public string Name { get; set; }
            public IEnumerable<string> ClaimTypes { get; set; }
        }
    }
}