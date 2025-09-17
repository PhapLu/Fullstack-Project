// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import AccessControl from "accesscontrol";
const ac = new AccessControl();

const roles = () => {
  ac.grant("customer")
    .deleteOwn("customer")
    .updateOwn("customer")
    .readOwn("customer")
    .createOwn("customer");

  ac.grant("vendor").extend("customer");

  ac.grant("admin")
    .extend("vendor")
    .updateAny("customer")
    .deleteAny("customer")
    .createAny("customer")
    .readAny("customer");

  return ac;
};

export default roles();
