using System.Text.Json.Serialization;

namespace Lending.Api.DTOs
{
    public class Identifiers
    {

        [JsonPropertyName("isbn_13")]
        public List<string>? Isbn13 { get; set; }

        [JsonPropertyName("isbn_10")]
        public List<string>? Isbn10 { get; set; }
    }
}
