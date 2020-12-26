using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Serilog;

namespace OpenIdConnectServer.Helpers
{
    public class AccountOptionsHelper
    {
        public static void ConfigureAccountOptions(string accountOptionsStr)
        {
            var accountOptions = JsonConvert.DeserializeObject<JObject>(accountOptionsStr);
            var targetFields = typeof(IdentityServerHost.Quickstart.UI.AccountOptions).GetFields();
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