using System;
using System.Security.Claims;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OpenIdConnectServer.Utils
{
    public class ClaimJsonConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotSupportedException();
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var jObject = JObject.Load(reader);
            var type = jObject["Type"].Value<string>();
            var val = jObject["Value"].Value<string>();

            return new Claim(type, val);
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(Claim);
        }

        public override bool CanRead => true;
        public override bool CanWrite => false;
    }
}