using System.Threading.Tasks;
using IdentityServer4.Models;
using IdentityServer4.Validation;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System;
using System.Text.RegularExpressions;

namespace OpenIdConnectServer
{
    internal class UriValidator : IRedirectUriValidator
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