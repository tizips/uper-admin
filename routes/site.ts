export default [
  {
    name: '用户',
    icon: 'TeamOutlined',
    path: '/site/users',
    access: 'route',
    permission: 'site.user.paginate',
    component: '@/pages/Site/User/Paginate',
  },
  {
    name: '角色',
    icon: 'BranchesOutlined',
    path: '/site/roles',
    access: 'route',
    permission: 'site.role.paginate',
    component: '@/pages/Site/Role/Paginate',
  },
  {component: '@/pages/Errors/404'},
]
