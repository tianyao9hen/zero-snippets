import allIcon from '@renderer/assets/icons/all.svg'
import allDIcon from '@renderer/assets/icons/all_d.svg'
import addIcon from '@renderer/assets/icons/add.svg'
import addDIcon from '@renderer/assets/icons/add_d.svg'
import noFolderIcon from '@renderer/assets/icons/nofolder.svg'
import noFolderDIcon from '@renderer/assets/icons/nofolder_d.svg'
import folderIcon from '@renderer/assets/icons/folder.svg'
import folderDIcon from '@renderer/assets/icons/folder_d.svg'
import addArticleIcon from '@renderer/assets/icons/addArticle.svg'
import deleteIcon from '@renderer/assets/icons/delete.svg'
import openIcon from '@renderer/assets/icons/open.svg'
import openDIcon from '@renderer/assets/icons/open_d.svg'
import webIcon from '@renderer/assets/icons/web.svg'
import webDIcon from '@renderer/assets/icons/web_d.svg'

export const iconMap: { [key: string]: IconClass } = {
  all: {
    id: 'all',
    url: allIcon,
    dUrl: allDIcon
  },
  add: {
    id: 'add',
    url: addIcon,
    dUrl: addDIcon
  },
  noFolder: {
    id: 'noFolder',
    url: noFolderIcon,
    dUrl: noFolderDIcon
  },
  folder: {
    id: 'folder',
    url: folderIcon,
    dUrl: folderDIcon
  },
  addArticle: {
    id: 'addArticle',
    url: addArticleIcon,
    dUrl: addArticleIcon
  },
  delete: {
    id: 'delete',
    url: deleteIcon,
    dUrl: deleteIcon
  },
  open: {
    id: 'open',
    url: openIcon,
    dUrl: openDIcon
  },
  web: {
    id: 'web',
    url: webIcon,
    dUrl: webDIcon
  }
}
