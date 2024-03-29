import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Xiaofeng\'s Sign Language dataProcess System'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
