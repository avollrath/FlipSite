import { useRef } from 'react'
import {
  formatDateInputFromNativeValue,
  formatDateInputValue,
  formatNativeDateValue,
  toSupabaseTimestamp,
} from '@/lib/dateInput'

type DatePickerInputProps = {
  className: string
  onChange: (value: string) => void
  required?: boolean
  value: string
}

export function DatePickerInput({
  className,
  onChange,
  required,
  value,
}: DatePickerInputProps) {
  const nativeInputRef = useRef<HTMLInputElement | null>(null)
  const nativeValue = formatNativeDateValue(value)

  function openDatePicker() {
    const nativeInput = nativeInputRef.current

    if (!nativeInput) {
      return
    }

    try {
      if (typeof nativeInput.showPicker === 'function') {
        nativeInput.showPicker()
        return
      }

      nativeInput.click()
      nativeInput.focus()
    } catch {
      nativeInput.click()
      nativeInput.focus()
    }
  }

  function normalizeValue() {
    const normalizedValue = formatDateInputValue(toSupabaseTimestamp(value))

    if (normalizedValue) {
      onChange(normalizedValue)
    }
  }

  return (
    <div className="relative flex gap-2">
      <input
        className={className}
        inputMode="numeric"
        onBlur={normalizeValue}
        onChange={(event) => onChange(event.target.value)}
        onClick={openDatePicker}
        onFocus={openDatePicker}
        placeholder="dd/MM/yyyy"
        required={required}
        value={value}
      />
      <input
        ref={nativeInputRef}
        className="pointer-events-none absolute bottom-0 right-0 h-px w-px opacity-0"
        type="date"
        tabIndex={-1}
        value={nativeValue}
        onChange={(event) => {
          const nextValue = formatDateInputFromNativeValue(event.target.value)

          if (nextValue) {
            onChange(nextValue)
          }
        }}
        aria-hidden="true"
      />
    </div>
  )
}
