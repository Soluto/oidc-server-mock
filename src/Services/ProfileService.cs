using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Test;
using Microsoft.Extensions.Logging;

namespace OpenIdConnectServer.Services
{
  internal class ProfileService : IProfileService
  {
    private readonly TestUserStore _userStore;
    private readonly ILogger Logger;

    public ProfileService(TestUserStore userStore, ILogger<ProfileService> logger)
    {
        _userStore = userStore;
        Logger = logger;
    }

    public Task GetProfileDataAsync(ProfileDataRequestContext context)
    {
        var subjectId = context.Subject.GetSubjectId();
        Logger.LogDebug("Getting profile data for subjectId: {subjectId}", subjectId);
        var user = this._userStore.FindBySubjectId(subjectId);
        if (user != null)
        {
            Logger.LogDebug("The user was found in store");
            var claims = context.FilterClaims(user.Claims);
            context.AddRequestedClaims(claims);
        }
        return Task.CompletedTask;
    }

    public Task IsActiveAsync(IsActiveContext context)
    {
        var subjectId = context.Subject.GetSubjectId();
        Logger.LogDebug("Checking if the user is active for subjectId: {subject}", subjectId);
        var user = this._userStore.FindBySubjectId(subjectId);
        context.IsActive = user?.IsActive ?? false;
        Logger.LogDebug("The user is active: {isActive}", context.IsActive);
        return Task.CompletedTask;
    }
  }
}