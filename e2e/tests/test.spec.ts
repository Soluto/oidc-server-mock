import axios from "axios";
import { expect } from "chai";
import * as querystring from "querystring";
import * as jwt from "jsonwebtoken";

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
        const token = jwt.decode(response.data.access_token);
        expect(token['scope']).to.deep.equal([ 'user-service-scope' ])
        expect(token['string_claim']).to.equal('string_claim_value');
        expect(token['json_claim']).to.deep.equal(['value1', 'value2']);
    });
});
