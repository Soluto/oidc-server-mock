using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OpenIdConnectServer.Helpers
{
    public class OptionsHelper
    {
        public static void ConfigureOptions<T>(string optionsStr)
        {
            var options = JsonConvert.DeserializeObject<JObject>(optionsStr);
            var targetFields = typeof(T).GetFields();
            var jValueValueProp = typeof(JValue).GetProperty(nameof(JValue.Value));
            Array.ForEach(targetFields, k => {
                if (options != null && options.ContainsKey(k.Name)) {
                    var fieldJValue = options[k.Name] as JValue;
                    var fieldValue = jValueValueProp?.GetValue(fieldJValue);
                    k.SetValue(null, fieldValue);
                }
            });
        }
    }
}
