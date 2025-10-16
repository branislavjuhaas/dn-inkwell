<template>
  <div>
    <h1>Index Page</h1>
    <p>Welcome to the index page!</p>
    <UButton
      color="neutral"
      variant="subtle"
      icon="ph:github-logo"
      @click="loginWithGithub">
      Login with github
    </UButton>
    <AppToolbar />
  </div>
</template>

<script setup lang="ts">
import { createAuthClient } from "better-auth/vue";

const authClient = createAuthClient();

const loginWithGithub = async () => {
  try {
    await authClient.signIn.social({ provider: "github" });
    console.log("Login successful");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
</script>

<style scoped></style>
