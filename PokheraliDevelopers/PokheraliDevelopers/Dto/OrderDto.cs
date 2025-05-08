<<<<<<< HEAD
﻿public class OrderDto
{
    public string ShippingAddress { get; set; }
    public string ShippingCity { get; set; }
    public string ShippingState { get; set; }
    public string ShippingZipCode { get; set; }
    public string PaymentMethod { get; set; }
    public List<OrderItemDto> Items { get; set; }
=======
﻿// DTOs/OrderDto.cs
using System;
using System.Collections.Generic;

public class OrderDto
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public string ClaimCode { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public bool BulkDiscount { get; set; }
    public bool StackableDiscount { get; set; }
    public DateTime? ProcessedDate { get; set; }
    public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
}