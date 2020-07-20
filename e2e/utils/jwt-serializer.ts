export default {
  test(arg: any): boolean {
    return arg.header && arg.payload && arg.signature;
  },
  print(val: any): string {
    const { alg, typ } = val.header;
    const { exp, iat, jti, nbf, ...payload } = val.payload;
    return JSON.stringify({ alg, typ, ...payload }, undefined, 2);
  },
};
