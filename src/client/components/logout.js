/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

import React, { Fragment } from "react";
import PropTypes from "prop-types";

/*************************************************************************/

export const Logout = ({ history, logOut }) => {
  logOut();
  // Go to login page
  history.push("/");
  return <Fragment />;
};

Logout.propTypes = {
  history: PropTypes.object.isRequired,
  logOut: PropTypes.func.isRequired
};
