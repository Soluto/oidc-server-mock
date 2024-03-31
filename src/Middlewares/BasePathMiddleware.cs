using Duende.IdentityServer.Extensions;
using Duende.IdentityServer.Configuration;
using Duende.IdentityServer.Services;

#pragma warning disable 1591

namespace OpenIdConnectServer.Middlewares
{
    public class BasePathMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IdentityServerOptions _options;

        public BasePathMiddleware(RequestDelegate next, IdentityServerOptions options)
        {
            _next = next;
            _options = options;
        }

        public async Task Invoke(HttpContext context)
        {
            var basePath = Config.GetAspNetServicesOptions().BasePath;
            var request = context.Request;
            if(request.Path.Value?.Length > basePath.Length)
            {
                request.Path = request.Path.Value.Substring(basePath.Length);
                context.RequestServices.GetRequiredService<IServerUrls>().BasePath = basePath;
            }
            await _next(context);
        }
    }
}
