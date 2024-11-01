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
      {
        layout: "reportlayout",
      },
      {
        layout: "materialinventorylayout",
      },
      {
        layout: "componentslayout",
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
        layout: "orderlayout",
      },
    ],
    //#endregion
  },

  {
    //#region Agents
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
      {
        layout: "reportlayout",
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
      {
        layout: "reportlayout",
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

exports.Validator = function (req, res, routelayout) {
  if (req.session.access == undefined) {
    res.redirect("/login");
  } else {
    for (const access of roleacess) {
      const { role, routes } = access;
      if (role == req.session.access) {
        for (const route of routes) {
          const { layout } = route;
          if (layout == routelayout) {
            return res.render(`${routelayout}`, {
              employeeid: req.session.employeeid,
              fullname: req.session.fullname,
              customerid: req.session.customerid,
              access: req.session.access,
              agentid: req.session.agentid,
              storepoints: req.session.storepoints,
            });
          }
        }
      }
    }
  }
};
