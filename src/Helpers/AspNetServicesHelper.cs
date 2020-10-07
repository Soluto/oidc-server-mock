using System.Collections.Generic;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace OpenIdConnectServer.Helpers
{
    public class AspNetServicesOptions
    {
        public IDictionary<string, AuthenticationOptions> Authentication { get; set; }
        public SessionOptions Session { get; set; }
    }

    public class AuthenticationOptions
    {
        public CookieAuthenticationOptions CookieAuthenticationOptions { get; set; }
    }

    public static class AspNetServicesHelper
    {
        public static void ApplyAspNetServicesOptions(IServiceCollection services, AspNetServicesOptions config)
        {
            if (config.Authentication != null)
            {
                ApplyAuthenticationOptions(services, config.Authentication);
            }

            if (config.Session != null)
            {
                ApplySessionOptions(services, config.Session);
            }
        }

        public static void ApplyAuthenticationOptions(IServiceCollection services, IDictionary<string, AuthenticationOptions> config)
        {
            foreach (var schemaConfig in config)
            {
                var builder = services.AddAuthentication(schemaConfig.Key);
                ApplyAuthenticationOptionsForScheme(builder, schemaConfig.Value);
            }
        }

        public static void ApplyAuthenticationOptionsForScheme(AuthenticationBuilder builder, AuthenticationOptions schemaConfig)
        {
            builder.AddCookie(options => {
                MergeHelper.Merge(schemaConfig.CookieAuthenticationOptions, options);
            });
        }

        public static void ApplySessionOptions(IServiceCollection services, SessionOptions config)
        {
            services.AddSession(options => {
                MergeHelper.Merge(config, options);
            });
        }
    }
}