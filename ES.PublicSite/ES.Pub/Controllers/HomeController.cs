using ES.Pub.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace ES.Pub.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
           
            ViewBag.DisplayName = ControllerContext.HttpContext.User.Identity.Name; 
            ViewBag.GroupName = "1";
            return View();
        }

        [AllowAnonymous]
        public ActionResult Redirector(string id)
        {
            TempData["EmailId"] = id;
            return RedirectToAction("Login", "Account");
        }
        
        public ActionResult Home()
        {

            return PartialView();
        }

        public ActionResult CreateRequest()
        {
            return PartialView();
        }

        public ActionResult MyRequest()
        {
            return PartialView();
        }

        public ActionResult MyFunction()
        {
            return PartialView();
        }
    }
}