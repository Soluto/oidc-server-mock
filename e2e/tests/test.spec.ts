import axios from "axios";
import { expect } from "chai";
import * as querystring from "querystring";
import { decode } from "jws";

describe("Test", () => {
    it("should work", async () => {
        const { CLIENT_CREDENTIALS_CLIENT_ID, CLIENT_CREDENTIALS_CLIENT_SECRET, API_RESOURCE } = process.env;
        const params = {
        client_id: CLIENT_CREDENTIALS_CLIENT_ID,
        client_secret: CLIENT_CREDENTIALS_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: API_RESOURCE,
    };

        const response = await axios.post(process.env.OIDC_TOKEN_URL, querystring.stringify(params));

        // tslint:disable-next-line:no-unused-expression
        expect(response).to.exist;
        // tslint:disable-next-line:no-unused-expression
        expect(response.data.access_token).to.exist;
        const token = decode(response.data.access_token);

        expect(token.header.typ).to.equal('JWT');
        expect(token.payload['iss']).to.equal('http://oidc-server-mock');
        expect(token.payload['aud']).to.equal('user-service');
        expect(token.payload['scope']).to.deep.equal([ 'user-service-scope' ])
        expect(token.payload['client_id']).to.equal('e2e-client-id');
        expect(token.payload['string_claim']).to.equal('string_claim_value');
        expect(token.payload['json_claim']).to.deep.equal(['value1', 'value2']);
    });
});
