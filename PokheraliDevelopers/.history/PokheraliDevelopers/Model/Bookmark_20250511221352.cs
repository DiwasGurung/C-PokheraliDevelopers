
﻿using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using PokheraliDevelopers.Models;


public class Bookmark
{
    [Key]
    public int Id { get; set; }


    [ForeignKey("BookId")]
    public virtual Book Book { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }
}
