using System.Collections.Generic;
using System.Reflection;
using IdentityServer4.Test;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace OpenIdConnectServer.Controllers
{
  [Route("api/v1/user")]
    public class UserController: Controller
    {
        private readonly TestUserStore _usersStore;
        private readonly ICollection<TestUser> _users;
        private readonly ILogger Logger;

        public UserController(TestUserStore userStore, ILogger<UserController> logger)
        {
            _usersStore = userStore;
            Logger = logger;

            var usersField = _usersStore.GetType().GetField("_users", BindingFlags.NonPublic | BindingFlags.Instance);
            _users = usersField.GetValue(_usersStore) as List<TestUser>;
        }

        [HttpGet("{subjectId}")]
        public IActionResult GetUser([FromRoute]string subjectId)
        {
            var user = _usersStore.FindBySubjectId(subjectId);
            Logger.LogDebug("GetUser: {subjectId}: {user}", subjectId, user);
            return Json(user);
        }

        [HttpPost]
        public IActionResult AddUser([FromBody]TestUser user)
        {
            _users.Add(user);
            Logger.LogDebug("AddUser {user}", user);
            return Json(user.SubjectId);
        }
    }
}