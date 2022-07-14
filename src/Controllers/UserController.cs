using System.Collections.Generic;
using System.Reflection;
using System.Security.Claims;
using Duende.IdentityServer.Test;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace OpenIdConnectServer.Controllers
{
  [Route("api/v1/user")]
    public class UserController: Controller
    {
        private readonly TestUserStore _usersStore;
        private readonly ILogger Logger;

        public UserController(TestUserStore userStore, ILogger<UserController> logger)
        {
            _usersStore = userStore;
            Logger = logger;
        }

        [HttpGet("{subjectId}")]
        public IActionResult GetUser([FromRoute]string subjectId)
        {
            var user = _usersStore.FindBySubjectId(subjectId);
            Logger.LogDebug("User found: {subjectId}", subjectId);
            return Json(user);
        }

        [HttpPost]
        public IActionResult AddUser([FromBody]TestUser user)
        {
            var claims = new List<Claim>(user.Claims);
            claims.Add(new Claim(ClaimTypes.Name, user.Username));
            var newUser =_usersStore.AutoProvisionUser("Alex", user.SubjectId, new List<Claim>(user.Claims));
            newUser.SubjectId = user.SubjectId;
            newUser.Username = user.Username;
            newUser.Password = user.Password;
            newUser.ProviderName = string.Empty;
            newUser.ProviderSubjectId = string.Empty;

            Logger.LogDebug("New user added: {user}", user.SubjectId);

            return Json(user.SubjectId);
        }
    }
}
