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
        var subjectId = context.Subject.GetSubjectId();
        var user = this._users.FirstOrDefault(u => u.SubjectId == subjectId);
        if (user != null)
        {
            var claims = context.FilterClaims(user.Claims);
            context.AddRequestedClaims(claims);
        }
        return Task.CompletedTask;
    }

    public Task IsActiveAsync(IsActiveContext context)
    {
        var subjectId = context.Subject.GetSubjectId();
        var user = this._users.FirstOrDefault(u => u.SubjectId == subjectId);
        context.IsActive = user?.IsActive ?? false;
        return Task.CompletedTask;
    }
  }
}