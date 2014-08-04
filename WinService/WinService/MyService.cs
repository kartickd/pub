using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MyService
{
    public partial class MyService : ServiceBase
    {
        public UserManager<ApplicationUser> MyUserManager { get; private set; }
        public MyService()
        {
            InitializeComponent();
            
            this.MyUserManager = new UserManager<ApplicationUser>(new UserStore<ApplicationUser>(new ApplicationDbContext()));
        }

        protected override void OnStart(string[] args)
        {
            long val = 200;
//            TimerCallback tcb = AddUser;
            // Create an event to signal the timeout count threshold in the 
            // timer callback.
            AutoResetEvent autoEvent = new AutoResetEvent(false);
            var timer = new Timer(AddUser, autoEvent, val,val);
            
            
        }

        public void AddUser(Object stateInfo)
        {
            AutoResetEvent autoEvent = (AutoResetEvent)stateInfo;
            Random g = new Random();
            int ge = g.Next();
            string uname= "Kartick" + Convert.ToString((ge));
            var user = new ApplicationUser() { UserName = uname, MyEmail = uname+"@cybage.com" };
            var result = MyUserManager.CreateAsync(user, "123456");
            autoEvent.Set();
        }

        protected override void OnStop()
        {
        }
    }
}
