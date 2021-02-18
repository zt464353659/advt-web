import defaultSettings from '@/settings'

const title = defaultSettings.title || '新平台广告发布管理系统'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
