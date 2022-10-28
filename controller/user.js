const userCol = require("../dataModel/userCol");
const database = require("../utils/database");
const jwt = require("../utils/token");
const bcrypt = require("bcrypt");
const moment = require("moment");
const ObjectID = require("mongodb").ObjectId;
const saltRounds = 10;

async function login(req, res) {
  try {
    const user = await database.userModel().findOne({ email: req.body.email });
    if (!user) {
      return res.json({ errorCode: true, data: "Tai khoan khong ton tai" });
    }
    if(req.body.role){
      if(user.role!==req.body.role){
        return res.json({ errorCode: true, data: `Khong the dang nhap bang tai khoan ${user.role} cho trang nay` });
      }
    }
    const checkPass = await bcrypt.compare(req.body.password, user.password);
    if (!checkPass) {
      return res.json({ errorCode: true, data: "Pass sai" });
    }
    if (!user.token) {
      user.token = await jwt.createSecretKey(req.body.email);
    }
    if (user.deletedAt) {
      return res.json({ errorCode: true, data: "Tai khoan da bi khoa" });
    }
    return res.json({ errorCode: null, data: user });
  } catch (error) {
    return res.json({ errorCode: true, data: error });
  }
}
async function register(req, res) {
  try {
    const validation = req.body;
    for (property of userCol.validation) {
      if (validation[property] === null || validation[property] === "") {
        return res.json({ errorCode: true, data: `Lack of ${property}` });
      }
    }
    const user = await database.userModel().findOne({ email: req.body.email });
    if (user) {
      return res.json({ errorCode: true, data: "Tai khoan da ton tai" });
    }
    if (req.body.confirmPassword) {
      const checkPass = req.body.password == req.body.confirmPassword;
      if (!checkPass) {
        return res.json({ errorCode: true, data: "Confirm password sai" });
      }
    }
    const password = await bcrypt.hash(req.body.password, saltRounds);
    const data = {
      id: ObjectID().toString(),
      email: req.body.email,
      prevPassword: null,
      password: password,
      name: req.body.name ?? "",
      phone: req.body.phone ?? "",
      address: req.body.address ?? "",
      gender: req.body.gender ?? "male",
      birthday: req.body.birthday
        ? moment(req.body.birthday, "DD/MM/YYYY").utc().toDate()
        : moment(new Date(), "DD/MM/YYYY").utc().toDate(),
      voucher: [],
      role: req.body.role ?? "user",
      createdAt: new Date(),
    };
    await userCol.create(data);
    if (!data.token) {
      data.token = await jwt.createSecretKey(req.body.email);
    }
    return res.json({ errorCode: null, data: data });
  } catch (error) {
    return res.json({ errorCode: true, data: "system error" });
  }
}

async function verify(req, res, next) {
  try {
    let token = req.headers["token"];
    if (!token) {
      return res.json({
        errorCode: true,
        data: "authentication fail",
      });
    }

    try {
      var payload = await jwt.decodeToken(token);
    } catch (e) {
      return res.json({
        errorCode: true,
        data: "jwt malformed",
      });
    }

    if (!payload) {
      return res.json({
        errorCode: true,
        data: "authentication fail",
      });
    }

    let account = [];
    account = await database.userModel().find({ email: payload }).toArray();

    if (account.length == 0 || account.length > 1) {
      return res.json({
        errorCode: true,
        data: "account not found",
      });
    }
    account[0].token = token;

    return res.json({
      errorCode: null,
      data: account[0],
    });
  } catch (error) {
    return res.json({
      errorCode: true,
      data: "System error",
    });
  }
}

module.exports = {
  login,
  register,
  verify,
};
