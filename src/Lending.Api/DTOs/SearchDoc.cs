using System.Text.Json.Serialization;

namespace Lending.Api.DTOs
{
    public class SearchDoc
    {

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("isbn")]
        public List<string>? Isbn { get; set; }
    }
}
