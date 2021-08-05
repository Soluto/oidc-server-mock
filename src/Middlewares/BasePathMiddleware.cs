using IdentityServer4.Extensions;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using IdentityServer4.Configuration;

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
            if(request.Path.Value.Length > basePath.Length)
            {
                request.Path = request.Path.Value.Substring(basePath.Length);
                context.SetIdentityServerBasePath(basePath);
            }
            await _next(context);
        }
    }
}
