using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Serilog;

namespace OpenIdConnectServer.Helpers
{
    public class LogoutOptionsHelper
    {
        public static void ConfigureLogoutOptions(string logoutOptionsStr)
        {
            var accountOptions = JsonConvert.DeserializeObject<JObject>(logoutOptionsStr);
            var targetFields = typeof(IdentityServerHost.Pages.Logout.LogoutOptions).GetFields();
            var jValueValueProp = typeof(JValue).GetProperty(nameof(JValue.Value));
            Array.ForEach(targetFields, k => {
                if (accountOptions.ContainsKey(k.Name)) {
                    var fieldJValue = accountOptions[k.Name] as JValue;
                    var fieldValue = jValueValueProp.GetValue(fieldJValue);
                    k.SetValue(null, fieldValue);
                }
            });
        }
    }
}
