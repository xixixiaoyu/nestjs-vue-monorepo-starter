import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Alert } from './Alert.vue'
export { default as AlertDescription } from './AlertDescription.vue'
export { default as AlertTitle } from './AlertTitle.vue'

export const alertVariants = cva('relative w-full rounded-lg border p-4', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive:
        'text-destructive border-destructive/50 dark:border-destructive [&>svg]:text-destructive',
      success: 'text-green-700 border-green-300 dark:border-green-600 [&>svg]:text-green-700',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type AlertVariants = VariantProps<typeof alertVariants>
