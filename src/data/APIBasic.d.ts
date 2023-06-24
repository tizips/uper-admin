declare namespace APIBasic {

  type doBasicAccount = {
    nickname?: string;
    avatar?: string;
    username?: string;
    mobile?: string;
    email?: string;
  }

  type doBasicModules = {
    code: string;
    name: string;
  };

  type Upload = {
    name?: string;
    uri?: string;
    url?: string;
  };
}
