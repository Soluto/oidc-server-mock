using System;
using System.Collections.Generic;
using System.Security.Claims;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Test;
using Newtonsoft.Json;
using OpenIdConnectServer.Utils;

namespace OpenIdConnectServer
{
    public static class Config
    {
        public static IEnumerable<ApiResource> GetApiResources() => new List<ApiResource>{
            new ApiResource(Environment.GetEnvironmentVariable("API_RESOURCE")),
        };

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
                configStr = System.IO.File.ReadAllText(configFilePath);
            }
            var configClients = Newtonsoft.Json.JsonConvert.DeserializeObject<IEnumerable<Client>>(configStr, new SecretConverter());
            return configClients;
        }

        public static IEnumerable<IdentityResource> GetIdentityResources() => new List<IdentityResource>
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            new IdentityResources.Email(),
        };

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
                configStr = System.IO.File.ReadAllText(configFilePath);
            }
            var configUsers = Newtonsoft.Json.JsonConvert.DeserializeObject<List<TestUser>>(configStr);
            return configUsers;
        }
    }
}