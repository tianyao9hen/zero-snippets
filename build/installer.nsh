!include "LogicLib.nsh"

!macro customUnInstall
  ; 删除注册表自启动项
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "electron.app.zero-snippets"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "zero-snippets"

  ; 删除桌面快捷方式
  Delete "$DESKTOP\zero-snippets.lnk"

  ; 删除开始菜单快捷方式
  Delete "$SMPROGRAMS\zero-snippets\zero-snippets.lnk"
  RMDir "$SMPROGRAMS\zero-snippets"

  ; 切换工作目录到临时文件夹，防止卸载程序锁定安装目录导致无法删除
  SetOutPath "$TEMP"

  ; ---------------------------------------------------------------------
  ; 用户选择是否删除用户数据
  ; ---------------------------------------------------------------------
  ; 用户数据存储在 %APPDATA%/zero-snippets/
  StrCpy $R0 "$APPDATA\zero-snippets"

  ; 检查用户数据目录是否存在
  IfFileExists "$R0\*" +2
    Goto skipUserDataPrompt

  ; 弹出对话框询问用户是否删除用户数据
  ; MB_YESNO = 4, MB_ICONQUESTION = 32, IDYES = 6
  MessageBox MB_YESNO|MB_ICONQUESTION "是否删除用户数据？$\n$\n用户数据包含您的知识库、书签、随手记等个人数据。$\n数据目录：$R0" IDYES deleteUserData IDNO skipUserDataPrompt

deleteUserData:
  ; 删除用户数据目录
  RMDir /r /REBOOTOK "$R0"
  Goto done

skipUserDataPrompt:
  ; 不删除用户数据

done:

  ; ---------------------------------------------------------------------
  ; 安全检查：防止误删用户数据
  ; ---------------------------------------------------------------------

  ; 检查1：必须包含主程序文件，确保我们正在操作正确的安装目录
  IfFileExists "$INSTDIR\zero-snippets.exe" +3
    MessageBox MB_OK|MB_ICONSTOP "卸载程序无法确认安装目录有效性（未找到 zero-snippets.exe），为防止误删数据，跳过目录清理。请手动删除 $INSTDIR"
    Return

  ; 检查2：防止删除磁盘根目录 (例如 C:\ 或 D:\)
  StrLen $R0 "$INSTDIR"
  ${If} $R0 < 4
    MessageBox MB_OK|MB_ICONSTOP "检测到安装目录为磁盘根目录 ($INSTDIR)，为防止数据丢失，卸载程序将只删除主程序文件。请手动清理剩余文件。"
    Delete "$INSTDIR\zero-snippets.exe"
    Delete "$INSTDIR\Uninstall zero-snippets.exe"
    Return
  ${EndIf}

  ; ---------------------------------------------------------------------
  ; 通过安全检查，执行递归删除
  ; ---------------------------------------------------------------------

  ; 强制删除整个安装目录，包括所有文件和子目录
  ; $INSTDIR 是用户安装时选择的目录
  RMDir /r /REBOOTOK "$INSTDIR"
!macroend
