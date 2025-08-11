using System.Text.Json.Serialization;

namespace Lending.Api.DTOs
{
    public class SearchResponse
    {

        [JsonPropertyName("docs")]
        public List<SearchDoc> Docs { get; set; } = new();
    }
}
