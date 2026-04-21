!include "LogicLib.nsh"

!macro customUnInstall
  SetShellVarContext current
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "electron.app.Zero Snippets"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Zero Snippets"

  Delete "$DESKTOP\Zero Snippets.lnk"
  Delete "$SMPROGRAMS\Zero Snippets\Zero Snippets.lnk"
  RMDir "$SMPROGRAMS\Zero Snippets"

  SetOutPath "$TEMP"

  StrCpy $R0 "$APPDATA\Zero Snippets"
  IfFileExists "$R0\*" +2
    Goto skipUserDataPrompt

  MessageBox MB_YESNO|MB_ICONQUESTION "是否删除用户数据？$\n$\n用户数据包含您的知识库、书签、随手记等个人数据。" IDYES deleteUserData IDNO skipUserDataPrompt

deleteUserData:
  RMDir /r /REBOOTOK "$R0"

skipUserDataPrompt:
!macroend
