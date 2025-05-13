using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Award> Awards { get; set; }
        public DbSet<BookAward> BookAwards { get; set; }

        //public DbSet<UserProfile> UserProfiles { get; set; }



        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure all DateTime properties to use UTC time
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        property.SetColumnType("timestamp with time zone");
                    }
                }
            }

            // Book entity configuration
            builder.Entity<Book>(entity =>
            {
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Title).HasMaxLength(255);
                entity.Property(e => e.Author).HasMaxLength(255);
                entity.Property(e => e.Genre).HasMaxLength(100);
                entity.HasIndex(e => e.ISBN).IsUnique();
            });

            // Order entity configuration
            builder.Entity<Order>(entity =>
            {
                // Configure OrderStatus to be stored as a string
                entity.Property(e => e.OrderStatus)
                      .HasConversion<string>();

                entity.HasOne(o => o.User)
                    .WithMany(u => u.Orders)
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // OrderItem entity configuration
            builder.Entity<OrderItem>(entity =>
            {
                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Book)
                    .WithMany(b => b.OrderItems)
                    .HasForeignKey(oi => oi.BookId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Review entity configuration
            builder.Entity<Review>(entity =>
            {
                entity.HasOne(r => r.User)
                    .WithMany(u => u.Reviews)
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Book)
                    .WithMany(b => b.Reviews)
                    .HasForeignKey(r => r.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Ensure one review per user per book
                entity.HasIndex(r => new { r.UserId, r.BookId }).IsUnique();
            });

            // Bookmark entity configuration
            builder.Entity<Bookmark>(entity =>
            {
                entity.HasOne(b => b.User)
                    .WithMany(u => u.Bookmarks)
                    .HasForeignKey(b => b.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(b => b.Book)
                    .WithMany(b => b.Bookmarks)
                    .HasForeignKey(b => b.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Ensure one bookmark per user per book
                entity.HasIndex(b => new { b.UserId, b.BookId }).IsUnique();
            });

            // CartItem entity configuration
            builder.Entity<CartItem>(entity =>
            {
                entity.HasOne(c => c.User)
                    .WithMany(u => u.CartItems)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.Book)
                    .WithMany(b => b.CartItems)
                    .HasForeignKey(c => c.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Ensure one cart item per user per book
                entity.HasIndex(c => new { c.UserId, c.BookId }).IsUnique();
            });

            // BookAward entity configuration
            builder.Entity<BookAward>(entity =>
            {
                entity.HasOne(ba => ba.Book)
                    .WithMany(b => b.BookAwards)
                    .HasForeignKey(ba => ba.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ba => ba.Award)
                    .WithMany(a => a.BookAwards)
                    .HasForeignKey(ba => ba.AwardId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}