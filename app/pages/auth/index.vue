<template>
  <UPage>
    <div class="flex flex-col items-center justify-center gap-4 p-4">
      <UPageCard class="w-full max-w-md">
        <UAuthForm
          :schema="schema"
          title="Login"
          description="Enter your credentials to access your account."
          icon="i-lucide-user"
          :fields="fields"
          :providers="providers"
          @submit="onSubmit">
          <template #description>
            Don't have an account?
            <ULink to="/auth/signup" class="text-primary font-medium">
              Sign up
            </ULink>
            .
          </template>
          <template #password-hint>
            <ULink
              to="/auth/forgot"
              class="text-primary font-medium"
              tabindex="-1">
              Forgot password?
            </ULink>
          </template>
          <template #validation>
            <UAlert
              v-if="authError"
              color="error"
              variant="subtle"
              icon="ph:warning"
              :title="authError" />
          </template>
        </UAuthForm>
      </UPageCard>
    </div>
  </UPage>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { createAuthClient } from "better-auth/vue";

const authClient = createAuthClient();
const authError = ref<string | null>(null);

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox",
  },
];

const providers = [
  {
    label: "Login with GitHub",
    icon: "ph:github-logo",
    onClick: async () => {
      await authClient.signIn.social(
        { provider: "github", callbackURL: "/" },
        {
          onSuccess: (ctx) => {
            console.log("Social login successful:", ctx);
            useUserStore().setUser(ctx.data.user);
          },
          onError: (err) => {
            authError.value = err.error.message || "Social login failed";
          },
        },
      );
    },
  },
];

const schema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string("Password is required")
    .min(8, "Must be at least 8 characters"),
  remember: z.boolean().optional(),
});

type Schema = z.output<typeof schema>;

const onSubmit = (payload: FormSubmitEvent<Schema>) => {
  authClient.signIn.email(
    {
      email: payload.data.email,
      password: payload.data.password,
      rememberMe: payload.data.remember || false,
      callbackURL: "/",
    },
    {
      onSuccess: (ctx) => {
        console.log("Login successful:", ctx);
        useUserStore().setUser(ctx.data.user);
      },
      onError: (err) => {
        authError.value = err.error.message || "Login failed";
      },
    },
  );
};
</script>

<style scoped></style>
