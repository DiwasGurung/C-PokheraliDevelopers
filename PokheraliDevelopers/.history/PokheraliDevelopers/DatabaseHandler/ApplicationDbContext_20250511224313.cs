using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Existing DbSet
        public DbSet<Book> Books { get; set; }

        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }

        // Optional: Configure any additional model mappings or constraints
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Example: Configure Book entity
            builder.Entity<Book>(entity =>
            {
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Title).HasMaxLength(255);
                entity.Property(e => e.Author).HasMaxLength(255);
                entity.Property(e => e.Genre).HasMaxLength(100);
            });

            // Configure Announcement entity
            builder.Entity<Announcement>(entity =>
            {
                entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Content).HasMaxLength(500).IsRequired();
            });

            // Configure Order entity
            builder.Entity<Order>(entity =>
            {
                entity.Property(e => e.OrderNumber).HasMaxLength(20).IsRequired();
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            });

            // Configure OrderItem entity
            builder.Entity<OrderItem>(entity =>
            {
                entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.UnitDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
            });

            // Configure Review entity
            builder.Entity<Review>(entity =>
            {
                entity.Property(e => e.Comment).HasMaxLength(1000).IsRequired();
            });
            // Configure CartItem entity
            builder.Entity<CartItem>(entity =>
            {
                entity.Property(e => e.Quantity).IsRequired();

                // Configure relationships
                entity.HasOne(ci => ci.Book)
                    .WithMany()
                    .HasForeignKey(ci => ci.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.User)
                    .WithMany()
                    .HasForeignKey(ci => ci.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure relationships and constraints
            builder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Book)
                .WithMany(b => b.OrderItems)
                .HasForeignKey(oi => oi.BookId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Bookmark>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Bookmark>()
                .HasOne(b => b.Book)
                .WithMany(b => b.Bookmarks)
                .HasForeignKey(b => b.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.Book)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}   