<template>
  <div class="flex items-center gap-1">
    <USelectMenu
      v-model="heading"
      :items="items"
      :icon="heading.icon"
      :search-input="false"
      variant="ghost"
      class="w-36" />
    <USeparator orientation="vertical" />
    <UButton
      @click="editor.chain().focus().toggleBold().run()"
      variant="ghost"
      color="neutral"
      :icon="editor.isActive('bold') ? 'ph:text-b-bold' : 'ph:text-b'"
      aria-label="Bold" />
    <UButton
      @click="editor.chain().focus().toggleItalic().run()"
      variant="ghost"
      color="neutral"
      :icon="
        editor.isActive('italic') ? 'ph:text-italic-bold' : 'ph:text-italic'
      "
      aria-label="Italic" />
    <UButton
      @click="editor.chain().focus().toggleUnderline().run()"
      variant="ghost"
      color="neutral"
      :icon="
        editor.isActive('underline')
          ? 'ph:text-underline-bold'
          : 'ph:text-underline'
      "
      aria-label="Underline" />
    <UButton
      @click="editor.chain().focus().toggleStrike().run()"
      variant="ghost"
      color="neutral"
      :icon="
        editor.isActive('strike')
          ? 'ph:text-strikethrough-bold'
          : 'ph:text-strikethrough'
      "
      aria-label="Strikethrough" />
    <USeparator orientation="vertical" />
    <UButton variant="ghost" color="neutral" icon="ph:image" />
  </div>
</template>

<script setup lang="ts">
import { Editor } from "@tiptap/vue-3";

const props = defineProps({
  editor: {
    type: Editor,
    required: true,
  },
});

const items = ref([
  [
    {
      label: "Heading 1",
      icon: "ph:text-h-one",
    },
    {
      label: "Heading 2",
      icon: "ph:text-h-two",
    },
    {
      label: "Heading 3",
      icon: "ph:text-h-three",
    },
    {
      label: "Paragraph",
      icon: "ph:text-t",
    },
  ],
]);

const heading = computed({
  get() {
    if (props.editor.isActive("heading", { level: 1 })) {
      return { label: "Heading 1", icon: "ph:text-h-one" };
    } else if (props.editor.isActive("heading", { level: 2 })) {
      return { label: "Heading 2", icon: "ph:text-h-two" };
    } else if (props.editor.isActive("heading", { level: 3 })) {
      return { label: "Heading 3", icon: "ph:text-h-three" };
    } else {
      return { label: "Paragraph", icon: "ph:text-t" };
    }
  },
  set(value) {
    if (value.label === "Heading 1") {
      props.editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value.label === "Heading 2") {
      props.editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value.label === "Heading 3") {
      props.editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else {
      props.editor.chain().focus().setParagraph().run();
    }
  },
});
</script>

<style scoped></style>
