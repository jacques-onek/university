"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  userId: string;
  bookId: string;
  bookTitle: string;
}

type ReservationItem = {
  slot: string;
  userId: string;
  createdAt: number;
  reservationId?: string;
};

const STORAGE_KEY = "bookwise-reading-reservations-v1";
const START_HOUR = 8;
const END_HOUR = 16;

const toDateInputValue = (date: Date) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
};

const formatDayLabel = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "2-digit",
  });

const monthLabel = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

const formatBoundaryDatePrefix = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", {
    month: "short",
    day: "2-digit",
  });

const buildSlots = () =>
  Array.from({ length: (END_HOUR - START_HOUR) * 4 }, (_, index) => {
    const startTotalMinutes = START_HOUR * 60 + index * 15;
    const endTotalMinutes = startTotalMinutes + 15;

    const startHour = Math.floor(startTotalMinutes / 60);
    const startMinute = startTotalMinutes % 60;
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;

    const startLabel = `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
    const endLabel = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
    return `${startLabel} - ${endLabel}`;
  });

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getDefaultBusySlots = (bookId: string, date: string, slots: string[]) => {
  const seed = hashSeed(`${bookId}:${date}`);
  const count = (seed % 4) + 2;
  const used = new Set<string>();

  for (let i = 0; i < count; i += 1) {
    const idx = (seed + i * 3) % slots.length;
    used.add(slots[idx]);
  }
  return used;
};

const ReadingReservationPanel = ({ userId, bookId, bookTitle }: Props) => {
  const slots = useMemo(() => buildSlots(), []);
  const todayStr = toDateInputValue(new Date());

  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [selectedStartIndex, setSelectedStartIndex] = useState<number | null>(null);
  const [selectedEndIndex, setSelectedEndIndex] = useState<number | null>(null);
  const [activeBoundary, setActiveBoundary] = useState<"start" | "end">("start");
  const [openPicker, setOpenPicker] = useState<"start" | "end" | null>(null);
  const [pickerMonth, setPickerMonth] = useState<Date>(new Date());
  const [localReservations, setLocalReservations] = useState<Record<string, ReservationItem[]>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, ReservationItem[]>;
      setLocalReservations(parsed);
    } catch {
      setLocalReservations({});
    }
  }, []);

  const storageKey = `${bookId}:${selectedDate}`;
  const reservations = useMemo(() => localReservations[storageKey] ?? [], [localReservations, storageKey]);

  const reservationsBySlot = useMemo(() => {
    const map = new Map<string, ReservationItem[]>();
    reservations.forEach((item) => {
      const existing = map.get(item.slot) ?? [];
      existing.push(item);
      map.set(item.slot, existing);
    });
    return map;
  }, [reservations]);

  const busyByDefault = useMemo(() => getDefaultBusySlots(bookId, selectedDate, slots), [bookId, selectedDate, slots]);
  const myTodayReservations = useMemo(
    () => reservations.filter((item) => item.userId === userId).sort((a, b) => slots.indexOf(a.slot) - slots.indexOf(b.slot)),
    [reservations, userId, slots]
  );

  const saveReservations = (next: Record<string, ReservationItem[]>) => {
    setLocalReservations(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const canReserveIndices = (startIndex: number, endIndex: number) => {
    if (startIndex < 0 || endIndex < 0 || startIndex > endIndex || endIndex >= slots.length) return false;
    return slots.slice(startIndex, endIndex + 1).every((slot) => {
      const existing = reservationsBySlot.get(slot) ?? [];
      return existing.length === 0 && !busyByDefault.has(slot);
    });
  };
  const isIndexOccupied = (index: number) => {
    const slot = slots[index];
    const existing = reservationsBySlot.get(slot) ?? [];
    return existing.length > 0 || busyByDefault.has(slot);
  };

  const selectedRangeSlots =
    selectedStartIndex !== null && selectedEndIndex !== null
      ? slots.slice(selectedStartIndex, selectedEndIndex + 1)
      : [];
  const selectedRangeAvailable =
    selectedStartIndex !== null && selectedEndIndex !== null
      ? canReserveIndices(selectedStartIndex, selectedEndIndex)
      : false;
  const selectedDuration = selectedRangeSlots.length;
  const selectedStartSlot = selectedStartIndex !== null ? slots[selectedStartIndex] : "";
  const selectedEndSlot = selectedEndIndex !== null ? slots[selectedEndIndex] : "";
  const datePrefix = formatBoundaryDatePrefix(selectedDate);
  const selectedStartLabel = selectedStartSlot
    ? `${datePrefix}, ${selectedStartSlot.split(" - ")[0]}`
    : `${datePrefix}, --:--`;
  const selectedEndLabel = selectedEndSlot ? `${datePrefix}, ${selectedEndSlot.split(" - ")[1]}` : `${datePrefix}, --:--`;

  const calendarDays = useMemo(() => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const first = new Date(year, month, 1);
    const firstWeekday = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number; value: string } | null> = [];

    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(year, month, day);
      cells.push({
        day,
        value: toDateInputValue(d),
      });
    }
    return cells;
  }, [pickerMonth]);

  const reserveSlot = () => {
    if (selectedStartIndex === null || selectedEndIndex === null) return;
    if (!selectedRangeAvailable) return;
    const reservationId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const nextItems: ReservationItem[] = selectedRangeSlots.map((slot) => ({
      slot,
      userId,
      createdAt: Date.now(),
      reservationId,
    }));
    const next = {
      ...localReservations,
      [storageKey]: [...reservations, ...nextItems],
    };
    saveReservations(next);
    setSelectedStartIndex(null);
    setSelectedEndIndex(null);
    setActiveBoundary("start");
    setOpenPicker(null);
  };

  const cancelMine = (slot: string) => {
    const mine = reservations.find((item) => item.slot === slot && item.userId === userId);
    if (!mine) return;

    const nextList = reservations.filter((item) => {
      if (mine.reservationId) return item.reservationId !== mine.reservationId;
      return !(item.slot === slot && item.userId === userId);
    });
    const next = { ...localReservations, [storageKey]: nextList };
    saveReservations(next);
    if (selectedRangeSlots.includes(slot)) {
      setSelectedStartIndex(null);
      setSelectedEndIndex(null);
      setActiveBoundary("start");
      setOpenPicker(null);
    }
  };
  const shiftMonth = (delta: number) => {
    setPickerMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleTimePick = (index: number) => {
    if (isIndexOccupied(index)) return;

    if (activeBoundary === "start" || selectedStartIndex === null) {
      setSelectedStartIndex(index);
      setSelectedEndIndex(index);
      setActiveBoundary("end");
      setOpenPicker("end");
      return;
    }

    if (index < selectedStartIndex) return;
    if (!canReserveIndices(selectedStartIndex, index)) return;

    setSelectedEndIndex(index);
    setOpenPicker(null);
  };

  return (
    <section className="reservation-panel">
      <div className="reservation-panel_head">
        <h3>Reserve Your Reading Slot</h3>
        <p>Choose a free slot to read &quot;{bookTitle}&quot;</p>
      </div>

      <p className="reservation-day-label">{formatDayLabel(selectedDate)}</p>
      <div className="reservation-boundary-row">
        <button
          type="button"
          className={cn("reservation-boundary-input", openPicker === "start" && "reservation-boundary-input_active")}
          onClick={() => {
            setActiveBoundary("start");
            setOpenPicker("start");
            setPickerMonth(new Date(`${selectedDate}T00:00:00`));
          }}
        >
          <small>From</small>
          <span>{selectedStartLabel}</span>
        </button>

        <span className="reservation-boundary-sep">to</span>

        <button
          type="button"
          className={cn("reservation-boundary-input", openPicker === "end" && "reservation-boundary-input_active")}
          onClick={() => {
            setActiveBoundary("end");
            setOpenPicker("end");
            setPickerMonth(new Date(`${selectedDate}T00:00:00`));
          }}
        >
          <small>To</small>
          <span>{selectedEndLabel}</span>
        </button>
      </div>
      <p className="reservation-day-label">
        Open From/To to pick exact date and time. Minimum reservation is 1 hour.
      </p>

      <div className="reservation-legend">
        <span>
          <i className="legend-free" /> Free
        </span>
        <span>
          <i className="legend-booked" /> Booked
        </span>
        <span>
          <i className="legend-mine" /> Your reservation
        </span>
      </div>

      {openPicker && (
        <div className="reservation-popup">
          <div className="reservation-popup_calendar">
            <div className="reservation-popup_header">
              <button type="button" className="reservation-day-btn" onClick={() => shiftMonth(-1)}>
                <ChevronLeft />
              </button>
              <p>{monthLabel(pickerMonth)}</p>
              <button type="button" className="reservation-day-btn" onClick={() => shiftMonth(1)}>
                <ChevronRight />
              </button>
            </div>

            <div className="reservation-popup_weekdays">
              <span>lu</span><span>ma</span><span>me</span><span>je</span><span>ve</span><span>sa</span><span>di</span>
            </div>

            <div className="reservation-popup_days">
              {calendarDays.map((cell, idx) => {
                if (!cell) return <span key={`empty-${idx}`} className="reservation-day-empty" />;
                const isSelected = cell.value === selectedDate;
                const disabled = cell.value < todayStr;

                return (
                  <button
                    key={cell.value}
                    type="button"
                    disabled={disabled}
                    className={cn("reservation-day-cell", isSelected && "reservation-day-cell_active")}
                    onClick={() => {
                      setSelectedDate(cell.value);
                      setSelectedStartIndex(null);
                      setSelectedEndIndex(null);
                    }}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="reservation-popup_times">
            <p className="reservation-popup_times-title">{openPicker === "start" ? "Start time" : "End time"}</p>
            <div className="reservation-popup_times-list">
              {slots.map((slot, index) => {
                const timeLabel = openPicker === "start" ? slot.split(" - ")[0] : slot.split(" - ")[1];
                const isDisabled =
                  isIndexOccupied(index) ||
                  (openPicker === "end" && (selectedStartIndex === null || index < selectedStartIndex)) ||
                  (openPicker === "end" && selectedStartIndex !== null && !canReserveIndices(selectedStartIndex, index));
                const selected =
                  openPicker === "start" ? selectedStartIndex === index : selectedEndIndex === index;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isDisabled}
                    className={cn("reservation-time-item", selected && "reservation-time-item_active")}
                    onClick={() => handleTimePick(index)}
                  >
                    {timeLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {myTodayReservations.length > 0 && (
        <div className="reservation-my-list">
          <p>Your reservations this day:</p>
          <div className="reservation-my-list-items">
            {myTodayReservations.map((item) => (
              <button key={`${item.slot}-${item.createdAt}`} type="button" onClick={() => cancelMine(item.slot)}>
                {item.slot}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="reservation-actions">
        {selectedStartIndex !== null && !selectedRangeAvailable && (
          <p className="reservation-error">Selected range overlaps occupied time. Choose another end time.</p>
        )}
        <button
          type="button"
          className="reservation-cta"
          disabled={selectedStartIndex === null || selectedEndIndex === null || !selectedRangeAvailable}
          onClick={reserveSlot}
        >
          Reserve {selectedDuration}h
        </button>
      </div>
    </section>
  );
};

export default ReadingReservationPanel;
