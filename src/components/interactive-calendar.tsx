// Interactive mood calendar with quadrimester/yearly view and animated transitions
"use client";

import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

const MOOD_COLORS = {
  coreMemory: { color: "#00C0E8", label: "Core Memory" },
  goodDay: { color: "#34C759", label: "A Good Day" },
  neutral: { color: "#FFD60A", label: "Neutral" },
  badDay: { color: "#FF8D28", label: "A Bad Day" },
  nightmare: { color: "#FF3C30", label: "Nightmare" },
} as const;

type MoodType = keyof typeof MOOD_COLORS;

interface DayEntry {
  mood: MoodType | null;
  workLog: string;
  journal: string;
}

interface CalendarData {
  [dateKey: string]: DayEntry;
}

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

function getContrastColor(moodKey: string): string {
  return moodKey === "neutral" ? "#000" : "#fff";
}

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

function MoodSelector({ selectedMood, onSelectMood }: MoodSelectorProps) {
  const [hoveredMood, setHoveredMood] = useState<MoodType | null>(null);
  const activeMood = hoveredMood || selectedMood;

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center gap-3 py-1">
        <div className="flex gap-2.5">
          {Object.entries(MOOD_COLORS).map(([key, { color, label }]) => (
            <button
              aria-label={label}
              aria-pressed={selectedMood === key}
              className={cn(
                "size-6 rounded-full transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedMood === key && "scale-110"
              )}
              key={key}
              onClick={() => onSelectMood(key as MoodType)}
              onMouseEnter={() => setHoveredMood(key as MoodType)}
              onMouseLeave={() => setHoveredMood(null)}
              style={{
                backgroundColor: color,
                boxShadow:
                  selectedMood === key
                    ? `0 0 0 2px var(--background), 0 0 0 4px ${color}`
                    : undefined,
              }}
              title={label}
              type="button"
            >
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>

        <div
          className={cn(
            "flex h-7 min-w-40 items-center justify-center rounded-full px-4 font-medium text-xs transition-colors duration-300",
            !activeMood && "bg-muted/30 text-muted-foreground"
          )}
          style={{
            backgroundColor: activeMood
              ? MOOD_COLORS[activeMood].color
              : "#525252",
            color: activeMood ? getContrastColor(activeMood) : undefined,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -5 }}
              initial={{ filter: "blur(4px)", opacity: 0, y: 5 }}
              key={activeMood || "none"}
              transition={{ duration: 0.2 }}
            >
              {activeMood ? MOOD_COLORS[activeMood].label : "select mood"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface DatePopoverProps {
  dateKey: string;
  entry: DayEntry;
  onSave: (dateKey: string, entry: DayEntry) => void;
  displayDate: string;
  children: React.ReactNode;
}

function DatePopover({
  dateKey,
  entry,
  onSave,
  displayDate,
  children,
}: DatePopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(entry.mood);
  const [workLog, setWorkLog] = useState(entry.workLog || "");
  const [journal, setJournal] = useState(entry.journal || "");

  useEffect(() => {
    setSelectedMood(entry.mood);
    setWorkLog(entry.workLog || "");
    setJournal(entry.journal || "");
  }, [entry.mood, entry.workLog, entry.journal]);

  const handleSave = () => {
    onSave(dateKey, { mood: selectedMood, workLog, journal });
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedMood(null);
    setWorkLog("");
    setJournal("");
    onSave(dateKey, { mood: null, workLog: "", journal: "" });
    setOpen(false);
  };

  const hasContent = Boolean(entry.workLog || entry.journal);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
          </TooltipTrigger>
          {hasContent && (
            <TooltipContent
              className="min-w-40 max-w-60 p-2.5 text-xs"
              side="top"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                  <h2 className="font-medium text-sm">
                    {Intl.DateTimeFormat().format(new Date(dateKey))}
                  </h2>
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{
                      backgroundColor: entry.mood
                        ? MOOD_COLORS[entry.mood].color
                        : "#525252",
                      borderColor: entry.mood
                        ? MOOD_COLORS[entry.mood].color
                        : undefined,
                    }}
                  />
                </div>
                {entry.workLog && (
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Work
                    </span>
                    <p className="wrap-break-word line-clamp-2 text-wrap text-xs">
                      {entry.workLog}
                    </p>
                  </div>
                )}
                {entry.journal && (
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                      Journal
                    </span>
                    <p className="wrap-break-word line-clamp-2 text-wrap text-xs">
                      {entry.journal}
                    </p>
                  </div>
                )}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-72" side="right" sideOffset={12}>
        <div className="space-y-4 text-center">
          <div className="space-y-0.5">
            <h4 className="font-medium text-foreground text-sm">
              {displayDate}
            </h4>
            <p className="text-muted-foreground text-xs">how was your day?</p>
          </div>

          <MoodSelector
            onSelectMood={setSelectedMood}
            selectedMood={selectedMood}
          />

          <div className="space-y-1.5">
            <Label
              className="font-medium text-xs lowercase"
              htmlFor={`work-${dateKey}`}
            >
              work log
            </Label>
            <Textarea
              className="min-h-15"
              id={`work-${dateKey}`}
              onChange={(e) => setWorkLog(e.target.value)}
              placeholder="what did you get done today?"
              rows={3}
              value={workLog}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              className="font-medium text-xs lowercase"
              htmlFor={`journal-${dateKey}`}
            >
              journal
            </Label>
            <Textarea
              className="min-h-15"
              id={`journal-${dateKey}`}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="how did it go overall?"
              rows={3}
              value={journal}
            />
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-transparent text-xs"
              onClick={handleClear}
              size="sm"
              variant="outline"
            >
              clear
            </Button>
            <Button className="flex-1 text-xs" onClick={handleSave} size="sm">
              save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// 2026 calendar configuration: startDay (0=Monday through 6=Sunday)
const MONTHS_2026 = [
  { name: "JANUARY", days: 31, startDay: 3 },
  { name: "FEBRUARY", days: 28, startDay: 6 },
  { name: "MARCH", days: 31, startDay: 6 },
  { name: "APRIL", days: 30, startDay: 2 },
  { name: "MAY", days: 31, startDay: 4 },
  { name: "JUNE", days: 30, startDay: 0 },
  { name: "JULY", days: 31, startDay: 2 },
  { name: "AUGUST", days: 31, startDay: 5 },
  { name: "SEPTEMBER", days: 30, startDay: 1 },
  { name: "OCTOBER", days: 31, startDay: 3 },
  { name: "NOVEMBER", days: 30, startDay: 6 },
  { name: "DECEMBER", days: 31, startDay: 1 },
];

interface DateCell {
  day: number;
  week: number;
  dayOfWeek: number;
}

function generateCalendarData(
  startDay: number,
  daysInMonth: number
): DateCell[] {
  const cells: DateCell[] = [];
  let dayOfWeek = startDay;
  let week = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, week, dayOfWeek });
    dayOfWeek++;
    if (dayOfWeek === 7) {
      dayOfWeek = 0;
      week++;
    }
  }

  return cells;
}

interface InteractiveCalendarProps {
  className?: string;
}

const QUADRIMESTERS = [
  { label: "Jan - Apr", months: [0, 1, 2, 3] },
  { label: "May - Aug", months: [4, 5, 6, 7] },
  { label: "Sep - Dec", months: [8, 9, 10, 11] },
];

// Layout constants
const CELL_SIZE = 20;
const CELL_GAP = 4;
const MONTH_GAP = 28;
const DAY_LABEL_WIDTH = 28;
const QUAD_CELL_SIZE = 36;
const QUAD_CELL_GAP = 6;
const QUAD_DAY_LABEL_WIDTH = 38;

function MonthGrid({
  month,
  monthIndex,
  getEntryForDate,
  getFillColor,
  handleSaveEntry,
  showAllYear,
  showNumbers,
  animationDelay = 0,
}: {
  month: (typeof MONTHS_2026)[number];
  monthIndex: number;
  getEntryForDate: (dateKey: string) => DayEntry;
  getFillColor: (dateKey: string) => string;
  handleSaveEntry: (dateKey: string, entry: DayEntry) => void;
  showAllYear: boolean;
  showNumbers: boolean;
  animationDelay?: number;
}) {
  const monthData = generateCalendarData(month.startDay, month.days);
  const maxWeeks = 6;

  // Use larger sizes for quadrimester view, smaller for full year
  const cellSize = showAllYear ? CELL_SIZE : QUAD_CELL_SIZE;
  const cellGap = showAllYear ? CELL_GAP : QUAD_CELL_GAP;
  const monthLabelHeight = showAllYear ? DAY_LABEL_WIDTH : QUAD_DAY_LABEL_WIDTH;
  const dayLabelHeight = showAllYear ? 16 : 20;
  const fontSize = showAllYear ? 10 : 14;
  const labelFontSize = showAllYear ? 7 : 11;

  const svgWidth = monthLabelHeight + 7 * (cellSize + cellGap);
  const svgHeight = dayLabelHeight + 7 * (cellSize + cellGap);

  return (
    <motion.div
      animate={{
        filter: "blur(0px)",
        opacity: 1,
        scale: showAllYear ? 1.1 : 1,
      }}
      className="flex flex-col items-center"
      initial={{ filter: "blur(8px)", opacity: 0, scale: 0.95 }}
      transition={{
        delay: animationDelay,
        duration: 0.4,
        ease: "easeOut",
      }}
    >
      {/** biome-ignore lint/a11y/noSvgWithoutTitle: Calendar month grid */}
      <svg
        aria-label={`${month.name} 2026 Mood Calendar`}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Month name - vertical with letters stacked */}
        <g>
          {month.name.split("").map((letter, i) => {
            const letterSpacing = showAllYear ? 12 : 16;
            const totalTextHeight = month.name.length * letterSpacing;
            const gridHeight = maxWeeks * (cellSize + cellGap);
            const startY = dayLabelHeight + (gridHeight - totalTextHeight) / 2;
            
            return (
              <text
                dominantBaseline="hanging"
                fill="#b5a1c2"
                fontFamily="LoraItalic, monospace"
                fontSize={showAllYear ? 11 : 16}
                fontWeight="600"
                key={`${letter}-${i}`}
                textAnchor="middle"
                x={monthLabelHeight / 2}
                y={startY + i * letterSpacing}
              >
                {letter}
              </text>
            );
          })}
        </g>

        {/* Day labels - horizontal at the top */}
        <g>
          {DAY_LABELS.map((label, i) => (
            <text
              dominantBaseline="hanging"
              fill="#b5a1c2"
              fontFamily="LoraItalic, monospace"
              fontSize={labelFontSize}
              fontWeight="500"
              key={label}
              textAnchor="middle"
              x={monthLabelHeight + cellSize / 2 + i * (cellSize + cellGap)}
              y="2"
            >
              {label}
            </text>
          ))}
        </g>

        {monthData.map((cell) => {
          const x = monthLabelHeight + cell.dayOfWeek * (cellSize + cellGap);
          const y = dayLabelHeight + cell.week * (cellSize + cellGap);
          const dateKey = getDateKey(2026, monthIndex + 1, cell.day);
          const entry = getEntryForDate(dateKey);
          const displayDate = new Date(
            2026,
            monthIndex,
            cell.day
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <DatePopover
              dateKey={dateKey}
              displayDate={displayDate}
              entry={entry}
              key={dateKey}
              onSave={handleSaveEntry}
            >
              <g className="group cursor-pointer">
                <rect
                  className="transition-all duration-200 group-hover:opacity-80"
                  fill={getFillColor(dateKey)}
                  height={cellSize}
                  rx="4"
                  width={cellSize}
                  x={x}
                  y={y}
                />
                {showNumbers && (
                  <text
                    dominantBaseline="central"
                    fill={
                      getFillColor(dateKey) === "#323232"
                        ? "#666"
                        : getContrastColor(
                            Object.entries(MOOD_COLORS).find(
                              ([, v]) => v.color === getFillColor(dateKey)
                            )?.[0] || ""
                          )
                    }
                    fontFamily="LoraItalic, monospace"
                    fontSize={fontSize}
                    fontWeight="500"
                    textAnchor="middle"
                    x={x + cellSize / 2}
                    y={y + cellSize / 2}
                  >
                    {String(cell.day).padStart(2, "0")}
                  </text>
                )}
              </g>
            </DatePopover>
          );
        })}
      </svg>
    </motion.div>
  );
}

export function InteractiveCalendar({ className }: InteractiveCalendarProps) {
  const [calendarData, setCalendarData] = useLocalStorage<CalendarData>(
    "mood-calendar-2026-data",
    {}
  );
  const [currentQuadrimester, setCurrentQuadrimester] = useState(0);
  const [showAllYear, setShowAllYear] = useState(false);
  const [showNumbers, setShowNumbers] = useLocalStorage(
    "mood-calendar-show-numbers",
    true
  );

  const handleSaveEntry = useCallback(
    (dateKey: string, entry: DayEntry) => {
      setCalendarData((prev) => ({
        ...prev,
        [dateKey]: entry,
      }));
    },
    [setCalendarData]
  );

  const getEntryForDate = useCallback(
    (dateKey: string): DayEntry => {
      return calendarData[dateKey] ?? { mood: null, workLog: "", journal: "" };
    },
    [calendarData]
  );

  const getFillColor = useCallback(
    (dateKey: string): string => {
      const entry = getEntryForDate(dateKey);
      if (entry.mood) {
        return MOOD_COLORS[entry.mood].color;
      }
      if (entry.workLog || entry.journal) {
        return "#525252"; // Color for entries without mood
      }
      return "#323232";
    },
    [getEntryForDate]
  );

  const currentMonths = showAllYear
    ? MONTHS_2026.map((_, i) => i)
    : QUADRIMESTERS[currentQuadrimester].months;

  const handlePrevQuadrimester = () => {
    setCurrentQuadrimester((prev) => (prev > 0 ? prev - 1 : 2));
  };

  const handleNextQuadrimester = () => {
    setCurrentQuadrimester((prev) => (prev < 2 ? prev + 1 : 0));
  };

  return (
    <div className={cn("flex min-h-0 flex-1 gap-2", className)}>
      <Card className="flex min-h-0 flex-1 flex-col gap-0 border-border/50 py-2">
        <CardHeader className="flex flex-row items-center justify-between px-3 pb-1 pt-1 mb-2">
          <CardTitle className="font-medium text-sm lowercase">
            moodbits 2026
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              aria-label={
                showNumbers ? "Hide date numbers" : "Show date numbers"
              }
              className="size-6 p-0 hover:cursor-pointer"
              onClick={() => setShowNumbers(!showNumbers)}
              size="sm"
              title={showNumbers ? "Hide numbers" : "Show numbers"}
              variant={showNumbers ? "default" : "outline"}
            >
              <svg
                aria-hidden="true"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <Button
              className="h-6 px-2 py-1 text-sm hover:cursor-pointer"
              onClick={() => setShowAllYear(!showAllYear)}
              size="sm"
              variant={showAllYear ? "default" : "outline"}
            >
              {showAllYear ? "quadrimester" : "full year"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className={cn("flex min-h-0 flex-1 overflow-auto py-3 md:overflow-auto px-4 pt-8 pb-8", showAllYear ? "lg:overflow-auto lg:pb-1" : "lg:overflow-hidden lg:mt-3 lg:pb-0")}>          {/* subtle purple gradient backdrop for calendar area */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-purple-800/10 via-transparent to-fuchsia-900/10"
          />
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ filter: "blur(0px)", opacity: 1 }}
              className={cn(
                "relative z-10 m-auto mt-1 flex w-full flex-col place-content-center items-center justify-start gap-0 md:h-full md:w-full lg:grid lg:justify-center lg:gap-0.5",
                showAllYear
                  ? "grid grid-cols-2 grid-rows-6 gap-x-2 gap-y-1 md:h-auto md:grid-cols-3 lg:h-auto lg:grid-cols-4 lg:grid-rows-3 lg:mt-2"
                  : "grid-cols-1 grid-rows-4 gap-x-2 gap-y-1 lg:grid-cols-2 lg:grid-rows-2 lg:mt-3"
              )}
              exit={{ filter: "blur(4px)", opacity: 0 }}
              initial={{ filter: "blur(4px)", opacity: 0 }}
              key={showAllYear ? "full-year" : `quad-${currentQuadrimester}`}
              style={{ gap: showAllYear ? `${MONTH_GAP}px` : undefined }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {currentMonths.map((monthIndex, i) => {
                const month = MONTHS_2026[monthIndex];
                return (
                  <MonthGrid
                    animationDelay={i * 0.05}
                    getEntryForDate={getEntryForDate}
                    getFillColor={getFillColor}
                    handleSaveEntry={handleSaveEntry}
                    key={month.name}
                    month={month}
                    monthIndex={monthIndex}
                    showAllYear={showAllYear}
                    showNumbers={showNumbers}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        {!showAllYear && (
          <CardFooter className="flex items-center justify-end px-3 mt-2">
            <div className="flex items-center gap-1">
              <Button
                aria-label="Previous quadrimester"
                className="size-6 p-0 hover:cursor-pointer"
                onClick={handlePrevQuadrimester}
                size="sm"
                variant="ghost"
              >
                <svg
                  aria-hidden="true"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <span className="min-w-16 text-center font-medium text-muted-foreground text-sm">
                {QUADRIMESTERS[currentQuadrimester].label}
              </span>
              <Button
                aria-label="Next quadrimester"
                className="size-6 p-0 hover:cursor-pointer"
                onClick={handleNextQuadrimester}
                size="sm"
                variant="ghost"
              >
                <svg
                  aria-hidden="true"
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
