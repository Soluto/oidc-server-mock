using System.Threading.Tasks;
using IdentityServer4.Models;
using IdentityServer4.Validation;
using System.Linq;
using System.Text.RegularExpressions;

namespace OpenIdConnectServer.Validation
{
  internal class RedirectUriValidator : IRedirectUriValidator
    {

        public Task<bool> IsPostLogoutRedirectUriValidAsync(string requestedUri, Client client)
        {
            return Task.FromResult<bool>(client.RedirectUris.Any(allowedUri =>
                Regex.Match(requestedUri, Regex.Escape(allowedUri).Replace("\\*", "[a-zA-Z0-9.]+?")).Success
            ));
        }

        public Task<bool> IsRedirectUriValidAsync(string requestedUri, Client client)
        {
            return Task.FromResult<bool>(client.RedirectUris.Any(allowedUri =>
                Regex.Match(requestedUri, Regex.Escape(allowedUri).Replace("\\*", "[a-zA-Z0-9.]+?")).Success
            ));        }
    }
}