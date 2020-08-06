module.exports = {
  test(arg) {
    return arg.header && arg.payload && arg.signature;
  },
  print(val) {
    const { alg, typ } = val.header;
    const { exp, iat, jti, nbf, auth_time, sid, at_hash, ...payload } = val.payload;
    return JSON.stringify({ alg, typ, ...payload }, undefined, 2);
  },
};
