commands = [
  {
    name: "login",
    controller: "user",
    method: "post",
    api: "/login",
    middleware: [],
  },
  {
    name: "register",
    controller: "user",
    method: "post",
    api: "/register",
    middleware: [],
  },
  {
    name: "verify",
    controller: "user",
    method: "get",
    api: "/verify",
    middleware: [],
  }
];
module.exports = commands;
