using System;
using Newtonsoft.Json;
using IdentityServer4.Models;

namespace OpenIdConnectServer.Utils
{
    public class SecretConverter : JsonConverter<Secret>
    {
        public override void WriteJson(JsonWriter writer, Secret value, JsonSerializer serializer)
        {
            writer.WriteValue(value.ToString());
        }

        public override Secret ReadJson(JsonReader reader, Type objectType, Secret existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            string s = (string)reader.Value;

            return new Secret(s.Sha256());
        }
    }
}