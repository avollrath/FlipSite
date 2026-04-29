import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const Command = forwardRef<
  ElementRef<typeof CommandPrimitive>,
  ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-lg bg-white text-zinc-950 dark:bg-[#13131a] dark:text-zinc-50',
      className,
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = forwardRef<
  ElementRef<typeof CommandPrimitive.Input>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-zinc-200 px-3 dark:border-white/10">
    <Search className="mr-2 h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = forwardRef<
  ElementRef<typeof CommandPrimitive.List>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-72 overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = forwardRef<
  ElementRef<typeof CommandPrimitive.Empty>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-6 text-center text-sm text-zinc-500 dark:text-zinc-400', className)}
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = forwardRef<
  ElementRef<typeof CommandPrimitive.Group>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn('p-1 text-zinc-950 dark:text-zinc-50', className)}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandItem = forwardRef<
  ElementRef<typeof CommandPrimitive.Item>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none aria-selected:bg-violet-50 aria-selected:text-violet-700 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 dark:aria-selected:bg-violet-500/15 dark:aria-selected:text-violet-200',
      className,
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
}
