import allIcon from '@renderer/assets/icons/all.svg'
import allDIcon from '@renderer/assets/icons/all_d.svg'
import addIcon from '@renderer/assets/icons/add.svg'
import addDIcon from '@renderer/assets/icons/add_d.svg'
import noFolderIcon from '@renderer/assets/icons/nofolder.svg'
import noFolderDIcon from '@renderer/assets/icons/nofolder_d.svg'
export const iconMap: {[key: string]: IconEntity} = {
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

  }
}
