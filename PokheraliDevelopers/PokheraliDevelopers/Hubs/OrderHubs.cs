using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace PokheraliDevelopers.Hubs
{
    public class OrderHub : Hub
    {
        public async Task BroadcastOrderDetails(string orderNumber, string bookTitles)
        {
            // This will send the message to all connected clients
            await Clients.All.SendAsync("ReceiveOrderDetails", orderNumber, bookTitles);
        }
    }
}
