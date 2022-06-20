using System;
using Newtonsoft.Json;
using Duende.IdentityServer.Models;

namespace OpenIdConnectServer.JsonConverters
{
    public class SecretJsonConverter : JsonConverter<Secret>
    {
        public override void WriteJson(JsonWriter writer, Secret value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }

        public override Secret ReadJson(JsonReader reader, Type objectType, Secret existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            string s = (string)reader.Value;

            return new Secret(s.Sha256());
        }
    }
}
