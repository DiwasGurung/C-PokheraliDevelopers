<<<<<<< HEAD
﻿using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
=======
﻿// Models/OrderItem.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60

public class OrderItem
{
    [Key]
    public int Id { get; set; }

<<<<<<< HEAD
    public int OrderId { get; set; }
=======
    [Required]
    public int OrderId { get; set; }

    [Required]
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    public int BookId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
<<<<<<< HEAD
    public decimal UnitPrice { get; set; }

    public decimal? UnitDiscount { get; set; }

    [Required]
    public decimal TotalPrice { get; set; }

    // Navigation properties
    [ForeignKey("OrderId")]
    public virtual Order Order { get; set; }

    [ForeignKey("BookId")]
=======
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountPercentage { get; set; }

    // Navigation properties
    public virtual Order Order { get; set; }
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    public virtual Book Book { get; set; }
}