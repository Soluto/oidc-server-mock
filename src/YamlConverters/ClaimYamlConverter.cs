using System.Security.Claims;
using YamlDotNet.Core;
using YamlDotNet.Core.Events;
using YamlDotNet.Serialization;

namespace OpenIdConnectServer.YamlConverters
{
    public class ClaimYamlConverter : IYamlTypeConverter
    {
        public bool Accepts(Type type)
        {
            return type == typeof(Claim);
        }

#nullable enable
        public void WriteYaml(IEmitter emitter, object? value, Type type)
        {
            throw new NotSupportedException();
        }
#nullable disable


        public object ReadYaml(IParser parser, Type type)
        {
            if (parser.Current.GetType() != typeof(MappingStart)) // You could also use parser.Accept<MappingStart>()
            {
                throw new InvalidDataException("Invalid YAML content.");
            }
            string claimType = "", claimValue = "", claimValueType = "";

            parser.MoveNext(); // move on from the map start

            do
            {
                var scalar = parser.Consume<Scalar>();
                switch (scalar.Value)
                {
                    case "Type":
                        claimType = parser.Consume<Scalar>().Value;
                        break;

                    case "Value":
                        claimValue = parser.Consume<Scalar>().Value;
                        break;

                    case "ValueType":
                        claimValueType = parser.Consume<Scalar>().Value;
                        break;
                }
            } while (parser.Current.GetType() != typeof(MappingEnd));

            parser.MoveNext(); // skip the mapping end (or crash)

            if (string.IsNullOrEmpty(claimType)) throw new InvalidDataException("Type is required property of Claim");
            if (string.IsNullOrEmpty(claimValue)) throw new InvalidDataException("Value is required property of Claim");
            if (string.IsNullOrEmpty(claimValueType)) claimValueType = ClaimValueTypes.String;
            return new Claim(claimType, claimValue, claimValueType);
        }

    }
}
