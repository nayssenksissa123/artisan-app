declare module 'passport-facebook' {
  import { Strategy as PassportStrategy } from 'passport';
  const Strategy: any;
  export { Strategy, Strategy as default };
}

declare module 'passport-google-oauth20' {
  const Strategy: any;
  export { Strategy, Strategy as default };
}
