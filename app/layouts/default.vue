<template>
  <div>
    <UHeader>
      <template #left>
      <NuxtLink to="/" aria-label="Back to home">
        <svg width="97" height="12" viewBox="0 0 97 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.736 0.799999H4.8C6.18667 0.799999 7.216 1.12533 7.888 1.776C8.56 2.416 8.896 3.41333 8.896 4.768V8.032C8.896 9.38667 8.56 10.3893 7.888 11.04C7.216 11.68 6.18667 12 4.8 12H0.736V9.968H1.792V2.816H0.736V0.799999ZM4.8 9.984C5.536 9.984 6.048 9.81333 6.336 9.472C6.63467 9.12 6.784 8.576 6.784 7.84V4.768C6.784 4.128 6.63467 3.64267 6.336 3.312C6.048 2.98133 5.536 2.816 4.8 2.816H3.904V9.984H4.8ZM16.2129 10.944H16.5009V0.799999H18.6129V12H14.4849L13.1729 1.856H12.8849V12H10.7729V0.799999H14.9009L16.2129 10.944ZM30.5426 0.799999H38.0306V2.816H35.3426V9.984H38.0306V12H30.5426V9.984H33.2306V2.816H30.5426V0.799999ZM45.6035 10.944H45.8915V0.799999H48.0035V12H43.8755L42.5635 1.856H42.2755V12H40.1635V0.799999H44.2915L45.6035 10.944ZM52.3284 12H50.2164V0.799999H52.3284V5.392H52.7924L55.7524 0.799999H58.1364V0.896L54.6804 6.256V6.544L58.3284 11.904V12H55.8484L52.7924 7.408H52.3284V12ZM68.0613 12H64.3813L63.8693 3.488V1.952H63.4852V3.488L62.9733 12H59.2933L58.9093 0.799999H60.8293L61.0853 9.312V10.752H61.4693V9.312L61.9813 0.799999H65.3733L65.8853 9.312V10.752H66.2693V9.312L66.5253 0.799999H68.4453L68.0613 12ZM69.8901 0.799999H76.9621V2.816H72.0021V5.376H76.7701V7.392H72.0021V9.984H77.1541V12H69.8901V0.799999ZM79.687 0.799999H81.799V9.984H86.887V12H79.687V0.799999ZM89.4839 0.799999H91.5959V9.984H96.6839V12H89.4839V0.799999Z" fill="#FFDBBB"/>
        </svg>
      </NuxtLink>
    </template>
    <template #right>
        <UFieldGroup v-if="data?.user">
          <UButton color="neutral" variant="subtle" :avatar="{src: `${data?.user?.image}`, alt: `${data?.user?.name}`}" to="/profile">{{ data?.user?.name }}</UButton>
          <UButton color="neutral" variant="subtle" icon="ph:gear-six" to="/settings"/>
        </UFieldGroup>
        <UButton v-else color="neutral" variant="subtle" icon="ph:keyhole" to="/auth">Sign In</UButton>
    </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
    <USeparator />
    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          Copyright © 2025 Branislav Juhás
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { createAuthClient } from 'better-auth/vue';

const authClient = createAuthClient({});
const { data } = await authClient.useSession(useFetch);

</script>