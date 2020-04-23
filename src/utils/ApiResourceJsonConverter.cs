using System;
using System.Linq;
using IdentityServer4.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OpenIdConnectServer.Utils
{
  public class ApiResourceJsonConverter : JsonConverter<ApiResource>
    {
        public override void WriteJson(JsonWriter writer, ApiResource value, JsonSerializer serializer)
        {
            throw new NotSupportedException();
        }

        public override ApiResource ReadJson(JsonReader reader, Type objectType, ApiResource existingValue, bool hasExistingValue,
            JsonSerializer serializer)
        {
            var jObject = JObject.Load(reader);
            var name = jObject["Name"].Value<string>();
            var scopes = jObject["Scopes"].Values<string>();
            return new ApiResource(name) { Scopes = scopes.ToHashSet() };
        }

        public override bool CanRead => true;
        public override bool CanWrite => false;
    }
}