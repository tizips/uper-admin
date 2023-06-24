export default [
  {
    name: '文章',
    icon: 'ReconciliationOutlined',
    path: '/blog/articles',
    access: 'route',
    permission: 'blog.article.paginate',
    component: '@/pages/Blog/Article/Paginate',
  },
  {
    name: '栏目',
    icon: 'AppstoreAddOutlined',
    path: '/blog/categories',
    access: 'route',
    permission: 'blog.category.tree',
    component: '@/pages/Blog/Category/Tree',
  },
  {
    name: '友链',
    icon: 'LinkOutlined',
    path: '/blog/links',
    access: 'route',
    permission: 'blog.link.paginate',
    component: '@/pages/Blog/Link/Paginate',
  },
  {
    name: '设置',
    icon: 'SettingOutlined',
    path: '/blog/setting',
    access: 'route',
    permission: 'blog.setting.list',
    component: '@/pages/Blog/Setting',
  },
];
