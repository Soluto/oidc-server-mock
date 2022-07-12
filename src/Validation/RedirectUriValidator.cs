using Duende.IdentityServer.Models;
using Duende.IdentityServer.Validation;
using System.Text.RegularExpressions;

namespace OpenIdConnectServer.Validation
{
    internal class RedirectUriValidator : IRedirectUriValidator
    {
        protected bool Validate(string requestedUri, ICollection<string> allowedUris) =>
            allowedUris.Any(allowedUri => Regex.Match(requestedUri, Regex.Escape(allowedUri).Replace("\\*", "[a-zA-Z0-9.]+?")).Success);

        public Task<bool> IsPostLogoutRedirectUriValidAsync(string requestedUri, Client client)
        {
            return Task.FromResult(Validate(requestedUri, client.PostLogoutRedirectUris));
        }

        public Task<bool> IsRedirectUriValidAsync(string requestedUri, Client client)
        {
            return Task.FromResult(Validate(requestedUri, client.RedirectUris));
        }
    }
}
