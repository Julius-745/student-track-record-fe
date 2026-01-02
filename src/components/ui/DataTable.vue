<script setup lang="ts">
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'

interface Column {
  key: string
  label: string
  class?: string
  sortable?: boolean
}

interface Props {
  columns: Column[]
  data: any[]
  isLoading?: boolean
  orderBy?: string
  order?: 'ASC' | 'DESC'
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  order: 'ASC',
})

const emit = defineEmits(['sort'])

const handleSort = (key: string) => {
  const column = props.columns.find((c) => c.key === key)
  if (!column?.sortable) return

  if (props.orderBy === key) {
    emit('sort', {
      orderBy: key,
      order: props.order === 'ASC' ? 'DESC' : 'ASC',
    })
  } else {
    emit('sort', {
      orderBy: key,
      order: 'ASC',
    })
  }
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
    <!-- Desktop Table View -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              :class="[col.class, col.sortable ? 'cursor-pointer select-none' : '']"
              @click="handleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <template v-if="col.sortable">
                  <ChevronUp v-if="orderBy === col.key && order === 'ASC'" class="h-4 w-4" />
                  <ChevronDown v-else-if="orderBy === col.key && order === 'DESC'" class="h-4 w-4" />
                  <ChevronsUpDown v-else class="h-3 w-3 opacity-50" />
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="i">
              <td :colspan="columns.length" class="px-6 py-4">
                <div class="h-4 w-full animate-pulse rounded bg-gray-100"></div>
              </td>
            </tr>
          </template>
          <template v-else-if="data.length === 0">
            <tr>
              <td :colspan="columns.length" class="px-6 py-12 text-center text-gray-500">
                Tidak Ada Data
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="(item, idx) in data" :key="idx" class="hover:bg-gray-50 transition-colors">
              <td
                v-for="col in columns"
                :key="col.key"
                class="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                :class="col.class"
              >
                <slot :name="col.key" :item="item">
                  {{ item[col.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden divide-y divide-gray-200">
      <template v-if="isLoading">
        <div v-for="i in 3" :key="i" class="p-4 space-y-3">
          <div class="h-4 w-3/4 animate-pulse rounded bg-gray-100"></div>
          <div class="h-4 w-1/2 animate-pulse rounded bg-gray-100"></div>
        </div>
      </template>
      <template v-else-if="data.length === 0">
        <div class="p-8 text-center text-gray-500">No data available</div>
      </template>
      <template v-else>
        <div v-for="(item, idx) in data" :key="idx" class="p-4 flex flex-col gap-2">
          <div
            v-for="col in columns"
            :key="col.key"
            class="flex justify-between items-start text-sm"
          >
            <span
              class="font-medium text-gray-500 text-xs uppercase tracking-wide min-w-[30%] pt-1"
              >{{ col.label }}</span
            >
            <div class="text-gray-900 font-medium text-right break-words flex-1 pl-2">
              <slot :name="col.key" :item="item">
                {{ item[col.key] }}
              </slot>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
