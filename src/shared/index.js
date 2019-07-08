/* Copyright G. Hemingway, 2019 - All rights reserved */
"use strict";

const validPassword = password => {
  if (!password || password.length < 8) {
    return { error: "Password length must be > 7" };
  } else if (!password.match(/[0-9]/i)) {
    return { error: `"password" must contain at least one numeric character` };
  } else if (!password.match(/[a-z]/)) {
    return { error: `"password" must contain at least one lowercase character` };
  } else if (!password.match(/\@|\!|\#|\$|\%|\^/i)) {
    return { error: `"password" must contain at least one of: @, !, #, $, % or ^` };
  } else if (!password.match(/[A-Z]/)) {
    return {
      error: `"password" must contain at least one uppercase character`
    };
  }
  return undefined;
};

const validUsername = username => {
  if (!username || username.length <= 2 || username.length >= 16) {
    return { error: "Username length must be > 2 and < 16" };
  } else if (!username.match(/^[a-z0-9]+$/i)) {
    return { error: "Username must be alphanumeric" };
  }
  return undefined;
};

module.exports = {
  validPassword: validPassword,
  validUsername: validUsername
};
