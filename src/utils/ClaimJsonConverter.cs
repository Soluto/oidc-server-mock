using System;
using System.Security.Claims;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OpenIdConnectServer.Utils
{
    public class ClaimJsonConverter : JsonConverter<Claim>
    {
        public override void WriteJson(JsonWriter writer, Claim value, JsonSerializer serializer)
        {
            throw new NotSupportedException();
        }

        public override Claim ReadJson(JsonReader reader, Type objectType, Claim existingValue, bool hasExistingValue,
            JsonSerializer serializer)
        {
            var jObject = JObject.Load(reader);
            var type = jObject["Type"].Value<string>();
            var val = jObject["Value"].Value<string>();

            return new Claim(type, val);
        }

        public override bool CanRead => true;
        public override bool CanWrite => false;
    }
}