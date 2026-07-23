# 为所有页面添加页脚的 PowerShell 脚本

# 页脚 HTML 模板
$footerTemplate = @'

    <!-- Footer -->
    <view class="page-footer">
      <text class="footer-text">作者：谭书宏，刘思冉</text>
      <text class="footer-icp" @click="openICP">湘ICP备2026021754号-2</text>
      <text class="footer-copy">© 2026 花月诗境 · www.mistiness.tshai.top</text>
    </view>
'@

# openICP 函数
$icpFunction = @'

function openICP() {
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodeURIComponent('https://beian.miit.gov.cn')}`
  })
}
'@

# 页脚样式
$footerStyles = @'

.page-footer {
  padding: 48rpx 28rpx 20rpx;
  align-items: center;
  gap: 12rpx;
}

.footer-text {
  font-size: 22rpx;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
}

.footer-icp {
  font-size: 22rpx;
  color: #2563eb;
  text-decoration: underline;
  text-align: center;
}

.footer-copy {
  font-size: 20rpx;
  color: #94a3b8;
  text-align: center;
}
'@

# 需要处理的页面列表（profile已有备案信息，跳过）
$pages = @(
    "index",
    "month", 
    "dynasty",
    "podcast",
    "auth"
)

foreach ($page in $pages) {
    $filePath = "h:\刘思冉\Mistiness\pages\$page\$page.uvue"
    Write-Host "Processing $filePath ..."
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # 添加页脚到模板底部（在最后的 </scroll-view> 之前）
        if ($content -notmatch 'class="page-footer"') {
            $content = $content -replace '(\s+<view style="height:\s*\d+rpx;?"></view>\s+</scroll-view>\s+</template>)', "$footerTemplate`n`$1"
            Write-Host "  ✓ Added footer template"
        }
        
        # 添加 openICP 函数（在最后一个函数之后，</script> 之前）
        if ($content -notmatch 'function openICP') {
            $content = $content -replace '(}\s*)(</script>)', "`$1$icpFunction`n`$2"
            Write-Host "  ✓ Added openICP function"
        }
        
        # 添加页脚样式（在 </style> 之前）
        if ($content -notmatch '\.page-footer') {
            $content = $content -replace '(</style>)', "$footerStyles`$1"
            Write-Host "  ✓ Added footer styles"
        }
        
        Set-Content $filePath $content -Encoding UTF8
        Write-Host "  ✓ Completed: $page"
    } else {
        Write-Host "  ✗ File not found: $filePath"
    }
}

Write-Host "`n✅ All pages processed!"
