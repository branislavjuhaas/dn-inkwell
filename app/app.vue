<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { createAuthClient } from "better-auth/vue";

await callOnce(async () => {
  const authClient = createAuthClient({});
  const { data } = await authClient.useSession(useFetch);

  if (data) {
    useUserStore().setUser(data.value?.user || null);
  }
});
</script>
