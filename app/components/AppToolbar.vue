<template>
  <UCard
    class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-muted/30 backdrop-blur-md shadow-lg w-200 max-w-[calc(100%-2rem)]"
    :ui="{ body: 'px-3! p-2 sm:p-2' }">
    <UPopover>
      <UButton
        color="neutral"
        variant="ghost"
        icon="ph:calendar-heart"
        aria-label="Select date">
        {{
          modelValue?.compare(today(getLocalTimeZone())) === 0
            ? "Today"
            : df.format(modelValue?.toDate(getLocalTimeZone()))
        }}
      </UButton>

      <template #content>
        <UCalendar v-model="modelValue" class="p-2" />
      </template>
    </UPopover>
  </UCard>
</template>

<script setup lang="ts">
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  today,
} from "@internationalized/date";

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});

const modelValue = shallowRef(today(getLocalTimeZone()));
</script>

<style scoped></style>
