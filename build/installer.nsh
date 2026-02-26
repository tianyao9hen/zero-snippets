!macro customUnInstall
  ; 强制删除整个安装目录，包括所有文件和子目录
  ; $INSTDIR 是用户安装时选择的目录
  RMDir /r "$INSTDIR"
!macroend
