import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
 forwardRef,
 type ComponentPropsWithoutRef,
 type ElementRef,
} from 'react'

function cn(...classes: Array<string | false | null | undefined>) {
 return classes.filter(Boolean).join(' ')
}

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = forwardRef<
 ElementRef<typeof PopoverPrimitive.Content>,
 ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'start', sideOffset = 8, ...props }, ref) => (
 <PopoverPrimitive.Portal>
 <PopoverPrimitive.Content
 ref={ref}
 align={align}
 sideOffset={sideOffset}
 className={cn(
  'z-50 w-72 rounded-lg border border-border-base bg-card p-0 text-base shadow-xl outline-none data-[state=open]:animate-soft-pop ',
  className,
 )}
 {...props}
 />
 </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverContent, PopoverTrigger }
