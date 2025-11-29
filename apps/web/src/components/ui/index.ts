import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './button/Button.vue'
export { default as Input } from './input/Input.vue'
export { default as Card } from './card/Card.vue'
export { default as CardHeader } from './card/CardHeader.vue'
export { default as CardTitle } from './card/CardTitle.vue'
export { default as CardDescription } from './card/CardDescription.vue'
export { default as CardContent } from './card/CardContent.vue'
export { default as CardFooter } from './card/CardFooter.vue'
export { default as Alert } from './alert/Alert.vue'
export { default as AlertTitle } from './alert/AlertTitle.vue'
export { default as AlertDescription } from './alert/AlertDescription.vue'

export { default as Dialog } from './Dialog.vue'
export { default as DialogClose } from './DialogClose.vue'
export { default as DialogContent } from './DialogContent.vue'
export { default as DialogDescription } from './DialogDescription.vue'
export { default as DialogFooter } from './DialogFooter.vue'
export { default as DialogHeader } from './DialogHeader.vue'
export { default as DialogScrollContent } from './DialogScrollContent.vue'
export { default as DialogTitle } from './DialogTitle.vue'
export { default as DialogTrigger } from './DialogTrigger.vue'

export { default as DropdownMenu } from './DropdownMenu.vue'
export { default as DropdownMenuCheckboxItem } from './DropdownMenuCheckboxItem.vue'
export { default as DropdownMenuContent } from './DropdownMenuContent.vue'
export { default as DropdownMenuGroup } from './DropdownMenuGroup.vue'
export { default as DropdownMenuItem } from './DropdownMenuItem.vue'
export { default as DropdownMenuLabel } from './DropdownMenuLabel.vue'
export { default as DropdownMenuRadioGroup } from './DropdownMenuRadioGroup.vue'
export { default as DropdownMenuRadioItem } from './DropdownMenuRadioItem.vue'
export { default as DropdownMenuSeparator } from './DropdownMenuSeparator.vue'
export { default as DropdownMenuShortcut } from './DropdownMenuShortcut.vue'
export { default as DropdownMenuSub } from './DropdownMenuSub.vue'
export { default as DropdownMenuSubContent } from './DropdownMenuSubContent.vue'
export { default as DropdownMenuSubTrigger } from './DropdownMenuSubTrigger.vue'
export { default as DropdownMenuTrigger } from './DropdownMenuTrigger.vue'

export { default as Tabs } from './Tabs.vue'
export { default as TabsContent } from './TabsContent.vue'
export { default as TabsList } from './TabsList.vue'
export { default as TabsTrigger } from './TabsTrigger.vue'

export { default as Select } from './Select.vue'
export { default as SelectContent } from './SelectContent.vue'
export { default as SelectGroup } from './SelectGroup.vue'
export { default as SelectItem } from './SelectItem.vue'
export { default as SelectItemText } from './SelectItemText.vue'
export { default as SelectLabel } from './SelectLabel.vue'
export { default as SelectScrollDownButton } from './SelectScrollDownButton.vue'
export { default as SelectScrollUpButton } from './SelectScrollUpButton.vue'
export { default as SelectSeparator } from './SelectSeparator.vue'
export { default as SelectTrigger } from './SelectTrigger.vue'
export { default as SelectValue } from './SelectValue.vue'

export { default as Badge } from './Badge.vue'
export { default as Avatar } from './Avatar.vue'
export { default as AvatarFallback } from './AvatarFallback.vue'
export { default as AvatarImage } from './AvatarImage.vue'
export { default as Skeleton } from './Skeleton.vue'
export { default as Switch } from './Switch.vue'
export { default as Toggle } from './Toggle.vue'
export { default as Tooltip } from './Tooltip.vue'
export { default as TooltipContent } from './TooltipContent.vue'
export { default as TooltipProvider } from './TooltipProvider.vue'
export { default as TooltipTrigger } from './TooltipTrigger.vue'
export { default as Separator } from './Separator.vue'

export { default as Toast } from './Toast.vue'
export { default as ToastAction } from './ToastAction.vue'
export { default as ToastClose } from './ToastClose.vue'
export { default as ToastDescription } from './ToastDescription.vue'
export { default as ToastProvider } from './ToastProvider.vue'
export { default as ToastTitle } from './ToastTitle.vue'
export { default as ToastViewport } from './ToastViewport.vue'
export { default as Toaster } from './Toaster.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        xs: 'h-7 rounded px-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
export type ButtonVariants = VariantProps<typeof buttonVariants>

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

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border-input bg-background',
        destructive: 'bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)
export type BadgeVariants = VariantProps<typeof badgeVariants>

export const avatarVariant = cva('', {
  variants: {
    size: { sm: 'size-8', md: 'size-10', lg: 'size-12' },
    shape: { circle: 'rounded-full', square: 'rounded-md' },
  },
  defaultVariants: { size: 'sm', shape: 'circle' },
})
export type AvatarVariants = VariantProps<typeof avatarVariant>

export const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      size: { default: 'h-9 px-2 min-w-9', sm: 'h-8 px-1.5 min-w-8', lg: 'h-10 px-2.5 min-w-10' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
export type ToggleVariants = VariantProps<typeof toggleVariants>

export type ToastProps = {
  class?: string
  variant?: 'default' | 'destructive'
  open?: boolean
  title?: string
  description?: string | any
  action?: any
  onOpenChange?: (open: boolean) => void
}
export const toastVariants = cva(
  'group pointer-events-auto relative w-full rounded-md border p-4 pr-12 shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'bg-red-50 text-red-700 border-red-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)
