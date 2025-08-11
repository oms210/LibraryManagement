using System.Text.Json.Serialization;

namespace Lending.Api.DTOs
{
    public class BookData
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("identifiers")]
        public Identifiers? Identifiers { get; set; }
    }
}
