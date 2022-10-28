const database = require("../utils/database");
const ObjectID = require("mongodb").ObjectId;
const userProperties = [
  "email",
  "name",
  "password",
  "phone",
  "address",
  "gender",
  "birthday",
  "voucher",
  "role",
];
const validation = [
  "email",
  "password"
];

async function getAll() {
  return await database.userModel().find({ role: "user" }).toArray();
}
async function create(data) {
  return await database.userModel().insertOne(data);
}

module.exports = {
  getAll,
  create,
  validation
};
