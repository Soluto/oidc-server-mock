using System.Text.RegularExpressions;
using Duende.IdentityServer.Services;

namespace OpenIdConnectServer.Services
{
    public class CorsPolicyService : ICorsPolicyService
    {
        public Task<bool> IsOriginAllowedAsync(string origin)
        {
            var allowedOrigins = Config.GetServerCorsAllowedOrigins();
            if (allowedOrigins != null && allowedOrigins.Count() > 0)
            {
                return Task.FromResult(allowedOrigins.Any(allowedOrigin =>
                    Regex.Match(origin, Regex.Escape(allowedOrigin).Replace("\\*", "[a-zA-Z0-9.]+?")).Success));
            }
            return Task.FromResult(true);
        }
    }
}
