using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace ES.ChatHub
{
    public class EventServiceChatHub : Hub
    {
        public Task JoinGroup(string groupName)
        {
             Groups.Add(Context.ConnectionId, groupName);
             return Clients.Group(groupName).broadCastMessage(groupName, "kd", "joined");
            //return;
        }
        public void Send(string groupName,string name, string message)
        {
            // Call the addNewMessageToPage method to update clients.
            //Clients.All.broadCastMessage(name, message);
            Clients.Group(groupName).broadCastMessage(groupName, name, message);
        }
    }
}