'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, addMinutes, startOfDay, isBefore, isToday, setHours, setMinutes } from 'date-fns'

interface OpeningHours {
  dayOfWeek: number
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}

interface ExceptionalDate {
  date: string
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
  note?: string
}

interface TimeSlotPickerProps {
  selectedDate: Date | null
  selectedTime: string | null
  onDateChange: (date: Date) => void
  onTimeChange: (time: string) => void
  openingHours?: OpeningHours[]
  exceptionalDates?: ExceptionalDate[]
  reservationDuration?: number // in minutes, default 120
  slotGranularity?: number // in minutes, default 15
  minAdvanceMinutes?: number // minimum minutes from now, default 30
}

export default function TimeSlotPicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  openingHours = [],
  exceptionalDates = [],
  reservationDuration = 120,
  slotGranularity = 15,
  minAdvanceMinutes = 30,
}: TimeSlotPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }
    
    return days
  }, [currentMonth])

  // Check if a date is available (not in the past, restaurant is open)
  const isDateAvailable = (date: Date): boolean => {
    const today = startOfDay(new Date())
    if (isBefore(date, today)) return false

    // Check for exceptional date
    const dateStr = format(date, 'yyyy-MM-dd')
    const exceptional = exceptionalDates.find(e => e.date === dateStr)
    if (exceptional) {
      return exceptional.isOpen
    }

    // Check regular opening hours
    const dayOfWeek = date.getDay()
    const hours = openingHours.find(h => h.dayOfWeek === dayOfWeek)
    if (hours) {
      return hours.isOpen
    }

    // If no opening hours defined, assume open
    return true
  }

  // Get opening hours for a specific date
  const getHoursForDate = (date: Date): { openTime: string; closeTime: string } | null => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const exceptional = exceptionalDates.find(e => e.date === dateStr)
    
    if (exceptional) {
      if (!exceptional.isOpen) return null
      return {
        openTime: exceptional.openTime || '09:00',
        closeTime: exceptional.closeTime || '22:00',
      }
    }

    const dayOfWeek = date.getDay()
    const hours = openingHours.find(h => h.dayOfWeek === dayOfWeek)
    
    if (hours && hours.isOpen) {
      return {
        openTime: hours.openTime || '09:00',
        closeTime: hours.closeTime || '22:00',
      }
    }

    // Default hours if none defined
    if (!hours) {
      return { openTime: '09:00', closeTime: '22:00' }
    }

    return null
  }

  // Generate time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return []

    const hours = getHoursForDate(selectedDate)
    if (!hours) return []

    const slots: string[] = []
    const [openHour, openMin] = hours.openTime.split(':').map(Number)
    const [closeHour, closeMin] = hours.closeTime.split(':').map(Number)

    let current = setMinutes(setHours(selectedDate, openHour), openMin)
    const closeTime = setMinutes(setHours(selectedDate, closeHour), closeMin)
    
    // Account for reservation duration - last slot should allow full duration
    const lastSlotTime = addMinutes(closeTime, -reservationDuration)
    
    const now = new Date()
    const minTime = addMinutes(now, minAdvanceMinutes)

    while (isBefore(current, lastSlotTime) || current.getTime() === lastSlotTime.getTime()) {
      // Only show future time slots
      if (!isBefore(current, minTime)) {
        slots.push(format(current, 'HH:mm'))
      }
      current = addMinutes(current, slotGranularity)
    }

    return slots
  }, [selectedDate, openingHours, exceptionalDates, reservationDuration, slotGranularity, minAdvanceMinutes])

  const formatTimeSlot = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    return format(date, 'h:mm a')
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Select Date
        </label>
        <div className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-lg p-4">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-[var(--text-primary)] font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs text-[var(--text-muted)] py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-2" />
              }

              const available = isDateAvailable(date)
              const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
              const isCurrentDay = isToday(date)

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => available && onDateChange(date)}
                  disabled={!available}
                  className={`p-2 text-sm rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--bg-app)]'
                      : available
                        ? 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)] cursor-not-allowed opacity-40'
                  } ${isCurrentDay && !isSelected ? 'ring-1 ring-[var(--color-primary)]' : ''}`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Time Slot Picker */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Select Time ({reservationDuration / 60}hr reservation)
          </label>
          {timeSlots.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-lg p-4 text-center text-[var(--text-muted)]">
              No available time slots for this date
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onTimeChange(time)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    selectedTime === time
                      ? 'bg-[var(--color-primary)] text-[var(--bg-app)] border-[var(--color-primary)]'
                      : 'bg-[var(--bg-card)] border-[var(--glass-border)] text-[var(--text-primary)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  {formatTimeSlot(time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
