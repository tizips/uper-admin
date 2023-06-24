declare namespace APISite {

  type doSiteRoleOfInformation = {
    id: number;
    name: string;
    permissions: string[];
    summary: string;
    created_at: string;
  }

  type doSitePermissions = {
    name?: string;
    code?: string;
    children?: Permission;
  };

  type doSiteRoleByOpening = {
    id?: number;
    name?: string;
  }
}
