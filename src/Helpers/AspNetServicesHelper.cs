using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using AspNetCorsOptions = Microsoft.AspNetCore.Cors.Infrastructure.CorsOptions;

namespace OpenIdConnectServer.Helpers
{
    public class AspNetServicesOptions
    {
        public AspNetCorsOptions? Cors { get; set; }

        public IDictionary<string, AuthenticationOptions>? Authentication { get; set; }
        public SessionOptions? Session { get; set; }

        public ForwardedHeadersOptions? ForwardedHeadersOptions { get; set; }

        public string? BasePath { get; set; }
    }

    public class AuthenticationOptions
    {
        public CookieAuthenticationOptions? CookieAuthenticationOptions { get; set; }
    }

    public static class AspNetServicesHelper
    {
        public static void ConfigureAspNetServices(IServiceCollection services, AspNetServicesOptions config)
        {
            if (config.Authentication != null)
            {
                ConfigureAuthenticationOptions(services, config.Authentication);
            }

            if (config.Session != null)
            {
                ConfigureSessionOptions(services, config.Session);
            }
        }

        public static void UseAspNetServices(IApplicationBuilder app, AspNetServicesOptions config)
        {
            if (config.Cors != null)
            {
                app.UseCors();
            }

            if (config.ForwardedHeadersOptions != null)
            {
                config.ForwardedHeadersOptions.KnownNetworks.Clear();
                config.ForwardedHeadersOptions.KnownProxies.Clear();
                app.UseForwardedHeaders(config.ForwardedHeadersOptions);
            }
        }

        public static void ConfigureAuthenticationOptions(IServiceCollection services, IDictionary<string, AuthenticationOptions> config)
        {
            foreach (var schemaConfig in config)
            {
                var builder = services.AddAuthentication(schemaConfig.Key);
                ConfigureAuthenticationOptionsForScheme(builder, schemaConfig.Value);
            }
        }

        private static void ConfigureAuthenticationOptionsForScheme(AuthenticationBuilder builder, AuthenticationOptions schemaConfig)
        {
            builder.AddCookie(options => {
                MergeHelper.Merge(schemaConfig.CookieAuthenticationOptions, options);
            });
        }

        private static void ConfigureSessionOptions(IServiceCollection services, SessionOptions config)
        {
            services.AddSession(options => {
                MergeHelper.Merge(config, options);
            });
        }

        private static void ConfigureCors(IServiceCollection services, AspNetCorsOptions corsConfig)
        {
            services.AddCors(options =>
                {
                    MergeHelper.Merge(corsConfig, options);
                }
            );
        }
    }
}
