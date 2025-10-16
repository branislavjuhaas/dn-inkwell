<template>
  <div>
    <UPage class="min-h-screen">
      <UPageSection>
        <EditorContent
          v-if="editor"
          :editor="editor"
          class="border rounded-lg p-4" />
      </UPageSection>
    </UPage>
    <AppToolbar :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";

const editor = ref<Editor>();

const placeholders = [
  "Jotting big ideas or where you left your keys?",
  "Grand ambitions or minor inconveniences—write it down.",
  "Deep thoughts, pointless errands, or both.",
  "Start a legacy or just another pizza night?",
  "Charting greatness—or groceries.",
  "Big revelations or random shower thoughts?",
  "Solving life, one awkward day at a time.",
  "Genius plans or what you ate for lunch?",
  "History in making, or a decent story later?",
  "Step on your epic quest—or snooze the alarm?",
];

const placeholder =
  placeholders[Math.floor(Math.random() * placeholders.length)] || "";

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
        emptyNodeClass:
          "first:before:content-[attr(data-placeholder)] first:before:text-muted first:before:float-left first:before:pointer-events-none first:before:h-0",
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    content: "<h1></h1>",
  });
  editor.value.commands.focus("start");
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
div:has(.tiptap) {
  border: none;
  padding: 0;
}
</style>
