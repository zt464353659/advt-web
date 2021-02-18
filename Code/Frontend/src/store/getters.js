const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  nameEn: state => state.user.nameEn,
  introduction: state => state.user.introduction,
  status: state => state.user.status,
  roles: state => state.user.roles,
  setting: state => state.user.setting,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  tagRouters: state => state.permission.tagRouters,
  errorLogs: state => state.errorLog.logs,
  userId: state => state.user.userId,
  userIp: state => state.user.userIp,
  systemCode: state => state.user.systemCode,
  actionUrl: state => state.user.actionUrl,
  // tagsList: state => state.tags.tagsList,
  theme: state => state.settings.theme,
  fixedHeader: state => state.settings.fixedHeader,
  title: state => state.settings.title,

  platforms: state => state.platform.allPlatforms,
  userInfo: state => state.user.info,
  permissions: state => state.user.permissions,
}
export default getters