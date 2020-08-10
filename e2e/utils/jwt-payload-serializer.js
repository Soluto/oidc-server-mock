module.exports = {
  test(arg) {
    return arg.iat && arg.exp && arg.nbf;
  },
  print(val) {
    const { exp, iat, jti, nbf, auth_time, sid, at_hash, ...payload } = val;
    return JSON.stringify(payload, undefined, 2);
  },
};
