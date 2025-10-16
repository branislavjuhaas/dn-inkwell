<template>
  <UPage>
    <UPageSection>
      <UButton
        color="warning"
        variant="subtle"
        icon="ph:plugs"
        @click="signOut">
        Sign Out
      </UButton>
    </UPageSection>
  </UPage>
</template>

<script setup lang="ts">
import { createAuthClient } from "better-auth/vue";

const authClient = createAuthClient();

const signOut = async () => {
  await authClient
    .signOut()
    .then(() => {
      useUserStore().clearUser();
      navigateTo("/");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
};
</script>

<style scoped></style>
