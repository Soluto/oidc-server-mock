using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Test;

namespace OpenIdConnectServer.Services
{
  internal class ProfileService : IProfileService
  {
    private readonly IEnumerable<TestUser> _users;

    public ProfileService()
    {
        _users = Config.GetUsers();
    }

    public Task GetProfileDataAsync(ProfileDataRequestContext context)
    {
        var userName = context.Subject.GetSubjectId();
        var user = this._users.FirstOrDefault(u => u.Username == userName);
        if (user != null)
        {
            var claims = context.FilterClaims(user.Claims);
            context.AddRequestedClaims(claims);
        }
        return Task.CompletedTask;
    }

    public Task IsActiveAsync(IsActiveContext context)
    {
        var userName = context.Subject.GetSubjectId();
        var user = this._users.FirstOrDefault(u => u.Username == userName);
        context.IsActive = user?.IsActive ?? false;
        return Task.CompletedTask;
    }
  }
}