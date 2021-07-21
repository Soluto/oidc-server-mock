module.exports = {
  test(argument) {
    return argument.iat && argument.exp && argument.nbf;
  },
  print(value) {
    const { exp, iat, jti, nbf, auth_time, sid, at_hash, ...payload } = value;
    return JSON.stringify(payload, undefined, 2);
  },
};
