<script setup lang="ts">
	// #ifdef APP-ANDROID || APP-HARMONY
	let firstBackTime = 0
	// #endif

	onLaunch(() => {
		uni.setNavigationBarColor({
			frontColor: '#000000',
			backgroundColor: '#e8f4fd',
		})
	})

	onAppShow(() => {})
	onAppHide(() => {})

	// #ifdef APP-ANDROID || APP-HARMONY
	onLastPageBackPress(() => {
		if (firstBackTime == 0) {
			uni.showToast({
				title: '再按一次退出应用',
				position: 'bottom',
			})
			firstBackTime = Date.now()
			setTimeout(() => {
				firstBackTime = 0
			}, 2000)
		} else if (Date.now() - firstBackTime < 2000) {
			firstBackTime = Date.now()
			uni.exit()
		}
	})

	onExit(() => {})
	// #endif
</script>

<style>
	page {
		background-color: #eef6fd;
	}

	.uni-row {
		flex-direction: row;
	}

	.uni-column {
		flex-direction: column;
	}
</style>