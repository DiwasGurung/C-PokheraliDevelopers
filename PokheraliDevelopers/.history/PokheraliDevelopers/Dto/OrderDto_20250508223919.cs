
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

}