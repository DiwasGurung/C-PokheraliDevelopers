using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Dto;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Services
{
    public class AwardService
    {
        private readonly ApplicationDbContext _context;

        public AwardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<string> GetBookAwardNames(int bookId)
        {
            return _context.BookAwards
                .Where(ba => ba.BookId == bookId)
                .Include(ba => ba.Award)
                .Select(ba => ba.Award.Name)
                .ToList();
        }
    }
}