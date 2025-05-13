using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using PokheraliDevelopers.Hubs;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Services
{
    public interface INotificationService
    {
        Task NotifyOrderPlacedAsync(Order order);
        Task NotifyOrderStatusChangedAsync(Order order);
    }

    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyOrderPlacedAsync(Order order)
        {
            var message = $"New order placed! Order #{order.Id}";
            await _hubContext.Clients.All.SendAsync("ReceiveOrderNotification", message);
        }

        public async Task NotifyOrderStatusChangedAsync(Order order)
        {
            var message = $"Order #{order.Id} status changed to {order.OrderStatus}";
            await _hubContext.Clients.All.SendAsync("ReceiveOrderNotification", message);
        }
    }
} 