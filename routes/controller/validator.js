const roleacess = [
  {
    //#region Admin
    role: "Admin",
    routes: [
      {
        layout: "indexlayout",
      },
      {
        layout: "accesslayout",
      },
      {
        layout: "paymentlayout",
      },
      {
        layout: "poslayout",
      },
      {
        layout: "chatlayout",
      },
      {
        layout: "employeelayout",
      },
      {
        layout: "userlayout",
      },
      {
        layout: "saleslayout",
      },
      {
        layout: "reportlayout",
      },
      {
        layout: "customerlayout",
      },
      {
        layout: "inventorylayout",
      },
      {
        layout: "productlayout",
      },
      {
        layout: "categorylayout",
      },
      {
        layout: "orderlayout",
      },
      {
        layout: "customerstorepointslayout",
      },
      {
        layout: "storepointshistorylayout",
      },
      {
        layout: "chatlayout",
      },
    ],
    //#endregion
  },
  {
    //#region User
    role: "User",
    routes: [
      {
        layout: "indexlayout",
      },
      {
        layout: "chatlayout",
      },
    ],
    //#endregion
  },

  {
    //#region User
    role: "Agents",
    routes: [
      {
        layout: "indexlayout",
      },
      {
        layout: "chatlayout",
      },
    ],
    //#endregion
  },
  {
    //#region Owner
    role: "Owner",
    routes: [
      {
        layout: "indexlayout",
      },
      {
        layout: "employeelayout",
      },
      {
        layout: "userlayout",
      },
      {
        layout: "saleslayout",
      },
      {
        layout: "reportlayout",
      },
      {
        layout: "customerlayout",
      },
      {
        layout: "inventorylayout",
      },
      {
        layout: "productlayout",
      },
      {
        layout: "categorylayout",
      },
    ],
    //#endregion
  },
  {
    //#region Manager
    role: "Manager",
    routes: [
      {
        layout: "indexlayout",
      },
      {
        layout: "employeelayout",
      },
      {
        layout: "userlayout",
      },
      {
        layout: "saleslayout",
      },
      {
        layout: "reportlayout",
      },
      {
        layout: "customerlayout",
      },
      {
        layout: "inventorylayout",
      },
      {
        layout: "productlayout",
      },
      {
        layout: "categorylayout",
      },
    ],
    //#endregion
  },

  {
    //#region Manager
    role: "customer",
    routes: [
      {
        layout: "productdisplaylayout",
      },
      {
        layout: "customerorderlayout",
      },
      {
        layout: "customerorderhistorylayout",
      },
      {
        layout: "customerchatlayout",
      },
    ],
    //#endregion
  },
];

exports.Validator = function (req, res, layout) {
  if (req.session.access == undefined) {
    res.redirect("/login");
  } else {
    roleacess.forEach((key, item) => {
      var routes = key.routes;
      routes.forEach((value, index) => {
        if (key.role == req.session.access && value.layout == layout) {
          console.log(req.session.access, layout);
          return res.render(`${layout}`, {
            employeeid: req.session.employeeid,
            fullname: req.session.fullname,
            customerid: req.session.customerid,
            access: req.session.access,
            agentid: req.session.agentid,
            storepoints: req.session.storepoints,
          });
        }
      });
    });
  }
};
