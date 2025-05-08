<<<<<<< HEAD
﻿public class ReviewDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string UserId { get; set; }
=======
﻿// DTOs/ReviewDto.cs
using System;

public class ReviewDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; }
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    public string UserName { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}