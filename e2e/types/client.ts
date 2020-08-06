import type Claim from './claim';

export default interface Client {
  ClientId: string;
  ClientSecrets?: string[];
  Description?: string;
  AllowedGrantTypes: string[];
  AllowedScopes: string[];
  RedirectUris?: string[];
  AllowAccessTokensViaBrowser?: boolean;
  AccessTokenLifetime?: number;
  IdentityTokenLifetime?: number;
  Claims?: Claim[];
  ClientClaimsPrefix?: string;
}
