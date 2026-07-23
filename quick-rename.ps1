# 快速重命名脚本 - 修复 H5 编译问题
cd "H:\刘思冉\Mistiness"

Write-Host "开始重命名文件..."

# 重命名 .uvue 为 .vue
Get-ChildItem -Recurse -Filter "*.uvue" | ForEach-Object {
    $newName = $_.Name -replace '\.uvue$','.vue'
    Rename-Item -Path $_.FullName -NewName $newName -Force
    Write-Host "  ✓ $($_.FullName) -> $newName"
}

# 重命名 .uts 为 .ts
Get-ChildItem -Recurse -Filter "*.uts" | ForEach-Object {
    $newName = $_.Name -replace '\.uts$','.ts'
    Rename-Item -Path $_.FullName -NewName $newName -Force
    Write-Host "  ✓ $($_.FullName) -> $newName"
}

Write-Host "`n✅ 所有文件重命名完成！"
Write-Host "请重新打开 HBuilderX 并刷新项目。"
