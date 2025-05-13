using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace PokheraliDevelopers.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task JoinOrderNotifications()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "OrderNotifications");
        }

        public async Task LeaveOrderNotifications()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "OrderNotifications");
        }
    }
} 