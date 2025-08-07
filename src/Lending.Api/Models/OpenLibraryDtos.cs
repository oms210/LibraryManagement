using System.Text.Json.Serialization;

namespace Lending.Api.Models
{
    public class SearchResponse
    {
        [JsonPropertyName("docs")]
        public List<SearchDoc> Docs { get; set; } = new();
    }

    public class SearchDoc
    {
        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("isbn")]
        public List<string>? Isbn { get; set; }
    }

    public class BookData
    {
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("identifiers")]
        public Identifiers? Identifiers { get; set; }
    }

    public class Identifiers
    {
        [JsonPropertyName("isbn_13")]
        public List<string>? Isbn13 { get; set; }

        [JsonPropertyName("isbn_10")]
        public List<string>? Isbn10 { get; set; }
    }
}
