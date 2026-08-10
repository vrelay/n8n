<script lang="ts" setup>
import BaseLayout from './BaseLayout.vue';
// LMS: hide main sidebar (Overview / Projects / Templates / Insights / Help).
// Uncomment to restore stock n8n chrome.
// import AppSidebar from '@/app/components/app/AppSidebar.vue';
</script>

<template>
	<BaseLayout>
		<!-- LMS: sidebar disabled — keep workflows list + create only -->
		<!--
		<template #sidebar>
			<AppSidebar />
		</template>
		-->
		<RouterView />
	</BaseLayout>
</template>
