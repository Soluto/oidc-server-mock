module.exports = {
  test(argument) {
    return argument.header && argument.payload && argument.signature;
  },
  print(value) {
    const { alg, typ } = value.header;
    const { exp, iat, jti, nbf, auth_time, sid, at_hash, ...payload } = value.payload;
    return JSON.stringify({ alg, typ, ...payload }, undefined, 2);
  },
};
