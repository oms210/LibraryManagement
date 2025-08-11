using Lending.Api.Models;
using Microsoft.EntityFrameworkCore;
using Lending.Api.DTOs;
using System;
using System.Text.Json;

namespace Lending.Api.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(AppDbContext db)
        {

            if (!await db.Books.AnyAsync())
                db.Books.AddRange(
                                new Book { ISBN = "9780141036137", Title = "The Hard Way", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283334", Title = "61 Hours", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780141036138", Title = "Killin Floor", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283335", Title = "Plan B", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780141036139", Title = "Bad Luck And Trouble", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283336", Title = "TripWire", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780141036140", Title = "Die Trying", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283337", Title = "Witout Fail", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780141036141", Title = "Persuader", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283338", Title = "The Enemy", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780141036142", Title = "Echo Burning", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283339", Title = "Running Blind", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780141036143", Title = "One Shot", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283340", Title = "Nothing To Lose", CoverUrl = "", Status = BookStatus.Available }
                                    );
           /*
            {
                try
                {


                    using var http = new HttpClient();
                    http.DefaultRequestHeaders.UserAgent.ParseAdd("LibraryManagementSystem/1.0 (omarr_syed@live.com)");

                    var searchUrl = "https://openlibrary.org/search.json?subject=fiction&limit=20";
                    var searchRes = await http.GetStringAsync(searchUrl);
                    var search = JsonSerializer.Deserialize<SearchResponse>(searchRes);

                    if (search != null && search.Docs.Any())
                    {
                        var isbns = search.Docs
                            .SelectMany(d => d.Isbn ?? new List<string>())
                            .Distinct()
                            .Take(5)
                            .ToList();

                        if (isbns.Any())
                        {
                            foreach (var isbn in isbns)
                            {
                                db.Books.Add(new Book
                                {
                                    ISBN = isbn,
                                    Title = search.Docs.First().Title ?? "Unknown",
                                    CoverUrl = $"https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg",
                                    Status = BookStatus.Available
                                });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    db.Books.AddRange(
                                new Book { ISBN = "9780141036137", Title = "1984", CoverUrl = "", Status = BookStatus.Available },
                                new Book { ISBN = "9780140283334", Title = "Brave New World", CoverUrl = "", Status = BookStatus.Available }
                                    );
                    Console.WriteLine($"Error seeding books. Falling back to default books: {ex.Message}");
                }

            }
           */
            if (!await db.Members.AnyAsync())
            {
                db.Members.AddRange(
                    new Member { FirstName = "Walter", LastName = "White", Email = "walter.white@example.com" },
                    new Member { FirstName = "Jesse", LastName = "Pinkman", Email = "jesse.pinkman@example.com" },
                    new Member { FirstName = "Skyler", LastName = "White", Email = "skyler.white@example.com" },
                    new Member { FirstName = "Gus", LastName = "Fring", Email = "gus.fring@example.com" },
                    new Member { FirstName = "hank", LastName = "schrader", Email = "hank.schrader@example.com" }
                );
            }

            await db.SaveChangesAsync();
        }
    }
}
