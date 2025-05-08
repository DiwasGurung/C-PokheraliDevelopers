

// Hubs/OrderHub.cs
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
namespace PokheraliDevelopers.Hubs { 
public class OrderHub : Hub<IOrderHub>
{
    public async Task JoinAdminGroup(string token)
    {
        // In a real application, you would validate the token
        // This is just a simple example
        if (token == "admin-token")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
    }

    public async Task JoinStaffGroup(string token)
    {
        // In a real application, you would validate the token
        if (token == "staff-token")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Staff");
        }
    }
}