import type Claim from './claim';

export default interface User {
  SubjectId: string;
  Username: string;
  Password: string;
  Claims?: Claim[];
}
