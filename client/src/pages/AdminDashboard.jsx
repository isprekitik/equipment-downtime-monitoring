import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Edit3,
  Gauge,
  MapPin,
  Moon,
  Plus,
  Search,
  Sun,
  Timer,
  Wrench,
  X,
} from 'lucide-react';

import { api } from '../api';
import LiveTimer from '../components/LiveTimer';

/*
|--------------------------------------------------------------------------
| THEME
|--------------------------------------------------------------------------
*/

const THEME_KEY = 'equipment-theme';

function getInitialTheme() {
  const saved =
    localStorage.getItem(
      THEME_KEY
    );

  if (
    saved === 'light' ||
    saved === 'dark'
  ) {
    return saved;
  }

  return window.matchMedia?.(
    '(prefers-color-scheme: dark)'
  ).matches
    ? 'dark'
    : 'light';
}

function useAppTheme() {
  const [
    theme,
    setTheme,
  ] = useState(
    getInitialTheme
  );

  useEffect(() => {
    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  return {
    theme,

    isDark:
      theme === 'dark',

    toggleTheme: () => {
      setTheme(
        (current) =>
          current === 'dark'
            ? 'light'
            : 'dark'
      );
    },
  };
}

/*
|--------------------------------------------------------------------------
| THEME BUTTON
|--------------------------------------------------------------------------
*/

function ThemeToggle({
  isDark,
  onToggle,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        flex
        h-11
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        px-3
        text-xs
        font-black
        transition-all

        sm:px-4
        sm:text-sm

        ${
          isDark
            ? `
                border-slate-600
                bg-slate-800
                text-white
                shadow-lg
                hover:bg-slate-700
              `
            : `
                border-blue-200
                bg-white
                text-slate-700
                shadow-lg
                shadow-blue-200/40
                hover:bg-blue-50
              `
        }
      `}
    >
      {isDark ? (
        <>
          <Sun
            size={18}
            className="text-amber-400"
          />

          <span>
            LIGHT
          </span>
        </>
      ) : (
        <>
          <Moon
            size={18}
            className="text-indigo-600"
          />

          <span>
            DARK
          </span>
        </>
      )}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDuration(
  ms = 0
) {
  const safe =
    Math.max(
      0,
      Number(ms) || 0
    );

  const seconds =
    Math.floor(
      safe / 1000
    );

  const hours =
    Math.floor(
      seconds / 3600
    );

  const minutes =
    Math.floor(
      (seconds % 3600) /
        60
    );

  const secs =
    seconds % 60;

  return `${String(
    hours
  ).padStart(
    2,
    '0'
  )}:${String(
    minutes
  ).padStart(
    2,
    '0'
  )}:${String(
    secs
  ).padStart(
    2,
    '0'
  )}`;
}

function localDateString(
  date = new Date()
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
}

function getToday() {
  return localDateString(
    new Date()
  );
}

function getWeekStart() {
  const now =
    new Date();

  const day =
    now.getDay();

  const offset =
    day === 0
      ? -6
      : 1 - day;

  const result =
    new Date(now);

  result.setDate(
    now.getDate() +
      offset
  );

  return localDateString(
    result
  );
}

function getMonthStart() {
  const now =
    new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(
    2,
    '0'
  )}-01`;
}

function prettyDate(
  value
) {
  if (!value) {
    return '-';
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }
  );
}

/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

function SummaryCard({
  title,
  value,
  subtitle,
  type = 'default',
  icon,
  isDark,
}) {
  let cardClasses = '';
  let iconClasses = '';

  if (
    type ===
    'operational'
  ) {
    cardClasses =
      isDark
        ? `
            border-emerald-500/60
            bg-gradient-to-br
            from-emerald-950/70
            to-emerald-900/20
            shadow-emerald-950/30
          `
        : `
            border-emerald-400
            bg-gradient-to-br
            from-emerald-50
            to-green-100
            shadow-emerald-200/50
          `;

    iconClasses =
      `
        bg-emerald-500
        text-white
        shadow-lg
        shadow-emerald-500/30
      `;
  } else if (
    type === 'down'
  ) {
    cardClasses =
      isDark
        ? `
            border-red-500/80
            bg-gradient-to-br
            from-red-950/80
            to-rose-950/40
            shadow-red-950/40
          `
        : `
            border-red-500
            bg-gradient-to-br
            from-red-50
            to-red-100
            shadow-red-200/60
          `;

    iconClasses =
      `
        bg-red-500
        text-white
        shadow-lg
        shadow-red-500/40
      `;
  } else if (
    type === 'standby'
  ) {
    cardClasses =
      isDark
        ? `
            border-amber-400/70
            bg-gradient-to-br
            from-amber-950/60
            to-yellow-950/20
            shadow-amber-950/30
          `
        : `
            border-amber-400
            bg-gradient-to-br
            from-amber-50
            to-yellow-100
            shadow-amber-200/50
          `;

    iconClasses =
      `
        bg-amber-500
        text-white
        shadow-lg
        shadow-amber-500/30
      `;
  } else {
    cardClasses =
      isDark
        ? `
            border-blue-500/30
            bg-gradient-to-br
            from-[#0c1d32]
            to-[#102b48]
            shadow-black/30
          `
        : `
            border-blue-200
            bg-gradient-to-br
            from-white
            to-blue-50
            shadow-blue-200/40
          `;

    iconClasses =
      `
        bg-gradient-to-br
        from-blue-600
        to-cyan-500
        text-white
        shadow-lg
        shadow-blue-500/30
      `;
  }

  return (
    <div
      className={`
        min-w-0
        rounded-2xl
        border-2
        p-3
        shadow-lg
        transition-all

        sm:p-4

        ${cardClasses}
      `}
    >
      <div className="flex items-start justify-between gap-2">

        <div className="min-w-0">

          <div
            className={`
              text-[10px]
              font-black
              uppercase
              tracking-wide

              sm:text-xs

              ${
                isDark
                  ? 'text-slate-300'
                  : 'text-slate-600'
              }
            `}
          >
            {title}
          </div>

          <div
            className={`
              mt-2
              truncate
              text-xl
              font-black

              sm:text-2xl

              ${
                isDark
                  ? 'text-white'
                  : 'text-slate-900'
              }
            `}
          >
            {value}
          </div>

          {subtitle && (
            <div className="mt-1 truncate text-[10px] font-semibold text-slate-500 sm:text-xs">
              {subtitle}
            </div>
          )}

        </div>

        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl

            sm:h-11
            sm:w-11

            ${iconClasses}
          `}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({
  status,
}) {
  const normalized =
    String(
      status ||
        'operational'
    ).toLowerCase();

  if (
    normalized ===
    'down'
  ) {
    return (
      <span className="rounded-full border border-red-500 bg-red-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg shadow-red-500/20 sm:text-xs">
        DOWN
      </span>
    );
  }

  if (
    normalized ===
    'standby'
  ) {
    return (
      <span className="rounded-full border border-amber-500 bg-amber-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg shadow-amber-500/20 sm:text-xs">
        STANDBY
      </span>
    );
  }

  return (
    <span className="rounded-full border border-emerald-500 bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-lg shadow-emerald-500/20 sm:text-xs">
      OPERATIONAL
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| EQUIPMENT CARD
|--------------------------------------------------------------------------
*/

function EquipmentCard({
  item,
  onEdit,
  isDark,
}) {
  const status =
    String(
      item.currentStatus ||
        'operational'
    ).toLowerCase();

  const down =
    status === 'down';

  const standby =
    status === 'standby';

  let outerClass = '';
  let headerClass = '';
  let timerColor = '';

  if (down) {
    outerClass =
      isDark
        ? `
            border-red-500
            bg-gradient-to-br
            from-red-950/85
            via-[#250d16]
            to-[#170b12]
            shadow-xl
            shadow-red-950/40
          `
        : `
            border-red-500
            bg-gradient-to-br
            from-red-50
            to-red-100
            shadow-xl
            shadow-red-200/60
          `;

    headerClass =
      isDark
        ? `
            border-red-500/50
            bg-red-500/10
          `
        : `
            border-red-300
            bg-red-100
          `;

    timerColor =
      isDark
        ? 'text-red-300'
        : 'text-red-700';
  } else if (
    standby
  ) {
    outerClass =
      isDark
        ? `
            border-amber-400/80
            bg-gradient-to-br
            from-amber-950/55
            to-[#15120b]
          `
        : `
            border-amber-400
            bg-amber-50
          `;

    headerClass =
      isDark
        ? `
            border-amber-500/30
            bg-amber-500/10
          `
        : `
            border-amber-300
            bg-amber-100
          `;

    timerColor =
      isDark
        ? 'text-amber-300'
        : 'text-amber-700';
  } else {
    outerClass =
      isDark
        ? `
            border-emerald-500/60
            bg-gradient-to-br
            from-emerald-950/45
            to-[#071813]
          `
        : `
            border-emerald-400
            bg-gradient-to-br
            from-emerald-50
            to-green-100
          `;

    headerClass =
      isDark
        ? `
            border-emerald-500/30
            bg-emerald-500/10
          `
        : `
            border-emerald-300
            bg-emerald-100
          `;

    timerColor =
      isDark
        ? 'text-emerald-300'
        : 'text-emerald-700';
  }

  const miniCard =
    isDark
      ? `
          border-slate-700
          bg-black/25
        `
      : `
          border-white
          bg-white/80
        `;

  return (
    <div
      className={`
        overflow-hidden
        rounded-2xl
        border-2
        transition-all

        ${outerClass}
      `}
    >
      <div
        className={`
          flex
          flex-col
          gap-3
          border-b
          p-4

          sm:flex-row
          sm:items-center
          sm:justify-between

          ${headerClass}
        `}
      >
        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3
              className={`
                text-lg
                font-black

                sm:text-xl

                ${
                  isDark
                    ? 'text-white'
                    : 'text-slate-900'
                }
              `}
            >
              {item.equipmentName ||
                item.equipmentNo}
            </h3>

            <StatusBadge
              status={
                item.currentStatus
              }
            />

          </div>

          <div
            className={`
              mt-2
              flex
              items-center
              gap-1.5
              text-xs
              font-black

              sm:text-sm

              ${
                down
                  ? isDark
                    ? 'text-red-300'
                    : 'text-red-700'
                  : standby
                  ? isDark
                    ? 'text-amber-300'
                    : 'text-amber-700'
                  : isDark
                  ? 'text-emerald-300'
                  : 'text-emerald-700'
              }
            `}
          >
            <MapPin
              size={14}
            />

            {item.location}
          </div>

        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">

          <div className="sm:text-right">

            <div className="text-[10px] font-bold uppercase text-slate-500 sm:text-xs">
              Current Timer
            </div>

            <div
              className={`
                mt-1
                font-mono
                text-lg
                font-black

                sm:text-xl

                ${timerColor}
              `}
            >
              {item.statusStartedAt ? (
                <LiveTimer
                  startedAt={
                    item.statusStartedAt
                  }
                />
              ) : (
                '00:00:00'
              )}
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              onEdit(item)
            }
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              transition

              ${
                isDark
                  ? `
                      border-slate-600
                      bg-slate-950/60
                      text-slate-300
                      hover:border-cyan-400
                      hover:text-cyan-300
                    `
                  : `
                      border-slate-300
                      bg-white
                      text-slate-700
                      hover:border-blue-500
                      hover:text-blue-600
                    `
              }
            `}
          >
            <Edit3
              size={17}
            />
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2">

        <div
          className={`
            rounded-xl
            border
            p-3

            sm:p-4

            ${miniCard}
          `}
        >
          <div className="mb-3">

            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 sm:text-xs">
              Previous Day
            </div>

            <div
              className={`
                mt-1
                text-sm
                font-black

                ${
                  isDark
                    ? 'text-white'
                    : 'text-slate-900'
                }
              `}
            >
              {prettyDate(
                item.previousDay
                  ?.date
              )}
            </div>

            <div className="mt-1 text-[10px] text-slate-500 sm:text-xs">
              0000H - 2400H
            </div>

          </div>

          <div className="grid grid-cols-2 gap-2">

            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">

              <div className="text-[10px] font-black uppercase text-emerald-500 sm:text-xs">
                Runtime
              </div>

              <div className="mt-1 font-mono text-sm font-black text-emerald-500 sm:text-lg">
                {formatDuration(
                  item.previousDay
                    ?.runtimeMs
                )}
              </div>

            </div>

            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3">

              <div className="text-[10px] font-black uppercase text-red-500 sm:text-xs">
                Downtime
              </div>

              <div className="mt-1 font-mono text-sm font-black text-red-500 sm:text-lg">
                {formatDuration(
                  item.previousDay
                    ?.downtimeMs
                )}
              </div>

            </div>

          </div>
        </div>

        <div
          className={`
            rounded-xl
            border
            p-3

            sm:p-4

            ${miniCard}
          `}
        >
          <div className="mb-3">

            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-500 sm:text-xs">
              Current Day
            </div>

            <div
              className={`
                mt-1
                text-sm
                font-black

                ${
                  isDark
                    ? 'text-white'
                    : 'text-slate-900'
                }
              `}
            >
              {prettyDate(
                item.currentDay
                  ?.date
              )}
            </div>

            <div className="mt-1 text-[10px] text-slate-500 sm:text-xs">
              0000H - Current Time
            </div>

          </div>

          <div className="grid grid-cols-2 gap-2">

            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">

              <div className="text-[10px] font-black uppercase text-emerald-500 sm:text-xs">
                Runtime
              </div>

              <div className="mt-1 font-mono text-sm font-black text-emerald-500 sm:text-lg">
                {formatDuration(
                  item.currentDay
                    ?.runtimeMs
                )}
              </div>

            </div>

            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3">

              <div className="text-[10px] font-black uppercase text-red-500 sm:text-xs">
                Downtime
              </div>

              <div className="mt-1 font-mono text-sm font-black text-red-500 sm:text-lg">
                {formatDuration(
                  item.currentDay
                    ?.downtimeMs
                )}
              </div>

            </div>

          </div>
        </div>

      </div>

      {down && (
        <div
          className={`
            border-t
            border-red-500/40
            px-4
            py-3
            text-xs
            font-black
            uppercase

            sm:text-sm

            ${
              isDark
                ? `
                    bg-red-500/15
                    text-red-200
                  `
                : `
                    bg-red-200
                    text-red-800
                  `
            }
          `}
        >
          <div className="flex items-center gap-2">

            <AlertTriangle
              size={17}
            />

            EQUIPMENT CURRENTLY DOWN

          </div>
        </div>
      )}

      {item.currentRemarks && (
        <div
          className={`
            border-t
            px-4
            py-3

            ${
              isDark
                ? `
                    border-slate-700
                    bg-black/15
                  `
                : `
                    border-slate-200
                    bg-white/70
                  `
            }
          `}
        >
          <div className="text-[10px] font-black uppercase text-slate-500 sm:text-xs">
            Current Remarks
          </div>

          <div
            className={`
              mt-1
              text-sm
              font-semibold

              ${
                isDark
                  ? 'text-slate-200'
                  : 'text-slate-800'
              }
            `}
          >
            {item.currentRemarks}
          </div>

        </div>
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOCATION SECTION
|--------------------------------------------------------------------------
*/

function LocationSection({
  location,
  items,
  onEdit,
  isDark,
}) {
  const operational =
    items.filter(
      (item) =>
        String(
          item.currentStatus
        ).toLowerCase() ===
        'operational'
    ).length;

  const down =
    items.filter(
      (item) =>
        String(
          item.currentStatus
        ).toLowerCase() ===
        'down'
    ).length;

  const standby =
    items.filter(
      (item) =>
        String(
          item.currentStatus
        ).toLowerCase() ===
        'standby'
    ).length;

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">

            <MapPin
              size={18}
            />

          </div>

          <h2
            className={`
              text-xl
              font-black

              ${
                isDark
                  ? 'text-white'
                  : 'text-slate-900'
              }
            `}
          >
            {location}
          </h2>

        </div>

        <div className="flex flex-wrap gap-2">

          <span
            className={`
              rounded-full
              border
              px-3
              py-1
              text-[10px]
              font-black

              sm:text-xs

              ${
                isDark
                  ? `
                      border-slate-600
                      bg-slate-800
                      text-slate-200
                    `
                  : `
                      border-slate-300
                      bg-white
                      text-slate-700
                    `
              }
            `}
          >
            {items.length} TOTAL
          </span>

          <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white sm:text-xs">
            {operational} OPERATIONAL
          </span>

          <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-black text-white sm:text-xs">
            {down} DOWN
          </span>

          {standby > 0 && (
            <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black text-white sm:text-xs">
              {standby} STANDBY
            </span>
          )}

        </div>

      </div>

      {items.length === 0 ? (
        <div
          className={`
            rounded-2xl
            border-2
            border-dashed
            p-8
            text-center
            text-sm

            ${
              isDark
                ? `
                    border-slate-700
                    bg-slate-900/40
                    text-slate-500
                  `
                : `
                    border-slate-300
                    bg-white
                    text-slate-500
                  `
            }
          `}
        >
          No equipment found.
        </div>
      ) : (
        <div className="grid gap-4">

          {items.map(
            (item) => (
              <EquipmentCard
                key={
                  item.key ||
                  item.equipmentNo
                }
                item={item}
                onEdit={onEdit}
                isDark={isDark}
              />
            )
          )}

        </div>
      )}

    </section>
  );
}

/*
|--------------------------------------------------------------------------
| EQUIPMENT MODAL
|--------------------------------------------------------------------------
*/

function EquipmentModal({
  open,
  mode,
  form,
  setForm,
  busy,
  error,
  onClose,
  onSave,
  isDark,
}) {
  if (!open) {
    return null;
  }

  const fieldClass =
    isDark
      ? `
          border-slate-600
          bg-[#08121f]
          text-white
        `
      : `
          border-slate-300
          bg-white
          text-slate-900
        `;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">

      <div
        className={`
          max-h-[92vh]
          w-full
          max-w-md
          overflow-y-auto
          rounded-2xl
          border-2
          shadow-2xl

          ${
            isDark
              ? `
                  border-blue-900
                  bg-[#0b1728]
                  text-white
                `
              : `
                  border-blue-200
                  bg-white
                  text-slate-900
                `
          }
        `}
      >
        <div
          className={`
            flex
            items-center
            justify-between
            border-b
            px-5
            py-4

            ${
              isDark
                ? 'border-slate-700'
                : 'border-slate-200'
            }
          `}
        >
          <div>

            <h2 className="text-xl font-black">
              {mode === 'add'
                ? 'ADD EQUIPMENT'
                : 'EDIT EQUIPMENT'}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Equipment masterlist
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl

              ${
                isDark
                  ? `
                      bg-slate-800
                      text-slate-300
                    `
                  : `
                      bg-slate-100
                      text-slate-700
                    `
              }
            `}
          >
            <X size={20} />
          </button>

        </div>

        <div className="space-y-4 p-5">

          <label className="block">

            <span className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Equipment Name
            </span>

            <input
              type="text"
              value={
                form.equipmentName
              }
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    equipmentName:
                      event.target
                        .value,
                  })
                )
              }
              className={`
                w-full
                rounded-xl
                border-2
                px-4
                py-3
                font-bold
                outline-none

                focus:border-cyan-500
                focus:ring-4
                focus:ring-cyan-500/10

                ${fieldClass}
              `}
              placeholder="RS 01"
            />

          </label>

          <label className="block">

            <span className="mb-1.5 block text-xs font-black uppercase text-slate-500">
              Location
            </span>

            <select
              value={
                form.location
              }
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    location:
                      event.target
                        .value,
                  })
                )
              }
              className={`
                w-full
                rounded-xl
                border-2
                px-4
                py-3
                font-bold
                outline-none

                focus:border-cyan-500

                ${fieldClass}
              `}
            >
              <option value="">
                Select Location
              </option>

              <option value="Bacao">
                Bacao
              </option>

              <option value="Enlin">
                Enlin
              </option>

            </select>

          </label>

          {error && (
            <div className="rounded-xl border-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500">
              {error}
            </div>
          )}

        </div>

        <div
          className={`
            flex
            flex-col-reverse
            gap-2
            border-t
            p-5

            sm:flex-row
            sm:justify-end

            ${
              isDark
                ? 'border-slate-700'
                : 'border-slate-200'
            }
          `}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`
              rounded-xl
              border-2
              px-5
              py-3
              font-black

              ${
                isDark
                  ? `
                      border-slate-600
                      text-slate-300
                    `
                  : `
                      border-slate-300
                      text-slate-700
                    `
              }
            `}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={
              busy ||
              !form.equipmentName.trim() ||
              !form.location
            }
            className="
              rounded-xl
              border-2
              border-cyan-300
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              px-5
              py-3
              font-black
              text-white
              shadow-lg
              shadow-blue-500/20
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {busy
              ? 'SAVING...'
              : mode ===
                'add'
              ? 'ADD EQUIPMENT'
              : 'SAVE CHANGES'}
          </button>

        </div>

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

export default function AdminDashboard() {
  const {
    isDark,
    toggleTheme,
  } = useAppTheme();

  const today =
    useMemo(
      getToday,
      []
    );

  const [
    startDate,
    setStartDate,
  ] = useState(today);

  const [
    endDate,
    setEndDate,
  ] = useState(today);

  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    equipmentDaily,
    setEquipmentDaily,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    dailyLoading,
    setDailyLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    modalMode,
    setModalMode,
  ] = useState('add');

  const [
    originalEquipmentNo,
    setOriginalEquipmentNo,
  ] = useState('');

  const [
    form,
    setForm,
  ] = useState({
    equipmentName: '',
    location: '',
  });

  const [
    modalBusy,
    setModalBusy,
  ] = useState(false);

  const [
    modalError,
    setModalError,
  ] = useState('');

  /*
  |--------------------------------------------------------------------------
  | LOAD SUMMARY
  |--------------------------------------------------------------------------
  */

  const loadSummary =
    async (
      start = startDate,
      end = endDate
    ) => {
      if (
        !start ||
        !end
      ) {
        return;
      }

      if (end < start) {
        setError(
          'End date cannot be earlier than start date.'
        );

        return;
      }

      try {
        setLoading(true);
        setError('');

        const result =
          await api(
            `/dashboard/summary?startDate=${encodeURIComponent(
              start
            )}&endDate=${encodeURIComponent(
              end
            )}`
          );

        setSummary(
          result
        );
      } catch (err) {
        setError(
          err.message ||
            'Unable to load summary.'
        );
      } finally {
        setLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | LOAD DAILY
  |--------------------------------------------------------------------------
  */

  const loadEquipmentDaily =
    async () => {
      try {
        setDailyLoading(
          true
        );

        const result =
          await api(
            '/dashboard/equipment-daily'
          );

        setEquipmentDaily(
          Array.isArray(result)
            ? result
            : []
        );
      } catch (err) {
        console.error(
          err
        );

        setError(
          err.message ||
            'Unable to load equipment status.'
        );
      } finally {
        setDailyLoading(
          false
        );
      }
    };

  useEffect(() => {
    loadSummary(
      today,
      today
    );

    loadEquipmentDaily();

    const interval =
      setInterval(
        loadEquipmentDaily,
        10000
      );

    return () =>
      clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | QUICK FILTER
  |--------------------------------------------------------------------------
  */

  const setRange = (
    start,
    end
  ) => {
    setStartDate(start);
    setEndDate(end);

    loadSummary(
      start,
      end
    );
  };

  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const operationalCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.currentStatus
        ).toLowerCase() ===
        'operational'
    ).length;

  const downCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.currentStatus
        ).toLowerCase() ===
        'down'
    ).length;

  const standbyCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.currentStatus
        ).toLowerCase() ===
        'standby'
    ).length;

  /*
  |--------------------------------------------------------------------------
  | LOCATION COUNTS
  |--------------------------------------------------------------------------
  */

  const bacaoOperationalCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
          'bacao' &&
        String(
          item.currentStatus
        ).toLowerCase() ===
          'operational'
    ).length;

  const enlinOperationalCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
          'enlin' &&
        String(
          item.currentStatus
        ).toLowerCase() ===
          'operational'
    ).length;

  const bacaoDownCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
          'bacao' &&
        String(
          item.currentStatus
        ).toLowerCase() ===
          'down'
    ).length;

  const enlinDownCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
          'enlin' &&
        String(
          item.currentStatus
        ).toLowerCase() ===
          'down'
    ).length;

  const bacaoStandbyCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
          'bacao' &&
        String(
          item.currentStatus
        ).toLowerCase() ===
          'standby'
    ).length;

  const enlinStandbyCount =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
          'enlin' &&
        String(
          item.currentStatus
        ).toLowerCase() ===
          'standby'
    ).length;

  /*
  |--------------------------------------------------------------------------
  | LOCATION
  |--------------------------------------------------------------------------
  */

  const bacao =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
        'bacao'
    );

  const enlin =
    equipmentDaily.filter(
      (item) =>
        String(
          item.location
        ).toLowerCase() ===
        'enlin'
    );

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  const openAdd =
    () => {
      setModalMode(
        'add'
      );

      setOriginalEquipmentNo(
        ''
      );

      setForm({
        equipmentName:
          '',
        location:
          '',
      });

      setModalError(
        ''
      );

      setModalOpen(
        true
      );
    };

  const openEdit =
    (item) => {
      setModalMode(
        'edit'
      );

      setOriginalEquipmentNo(
        item.equipmentNo
      );

      setForm({
        equipmentName:
          item.equipmentName ||
          item.equipmentNo ||
          '',

        location:
          item.location ||
          '',
      });

      setModalError(
        ''
      );

      setModalOpen(
        true
      );
    };

  const closeModal =
    () => {
      if (modalBusy) {
        return;
      }

      setModalOpen(
        false
      );

      setModalError(
        ''
      );
    };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const saveEquipment =
    async () => {
      const equipmentName =
        form.equipmentName.trim();

      const location =
        form.location;

      if (
        !equipmentName ||
        !location
      ) {
        setModalError(
          'Equipment name and location are required.'
        );

        return;
      }

      try {
        setModalBusy(
          true
        );

        setModalError(
          ''
        );

        if (
          modalMode ===
          'add'
        ) {
          await api(
            '/equipment/add',
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  equipmentName,
                  location,
                }),
            }
          );
        } else {
          await api(
            `/equipment/${encodeURIComponent(
              originalEquipmentNo
            )}`,
            {
              method:
                'PUT',

              body:
                JSON.stringify({
                  equipmentName,
                  location,
                }),
            }
          );
        }

        setModalOpen(
          false
        );

        await Promise.all([
          loadSummary(),
          loadEquipmentDaily(),
        ]);
      } catch (err) {
        setModalError(
          err.message ||
            'Failed to save equipment.'
        );
      } finally {
        setModalBusy(
          false
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | SHARED STYLE
  |--------------------------------------------------------------------------
  */

  const panelClass =
    isDark
      ? `
          border-blue-900/60
          bg-[#0b1728]
          shadow-black/30
        `
      : `
          border-blue-200
          bg-white
          shadow-blue-200/40
        `;

  const inputClass =
    isDark
      ? `
          border-slate-600
          bg-[#07111e]
          text-white
        `
      : `
          border-slate-300
          bg-white
          text-slate-900
        `;

  return (
    <div
      className={`
        min-h-screen
        transition-colors

        ${
          isDark
            ? `
                bg-gradient-to-br
                from-[#050c16]
                via-[#071522]
                to-[#082f49]
                text-white
              `
            : `
                bg-gradient-to-br
                from-slate-100
                via-sky-50
                to-blue-100
                text-slate-900
              `
        }
      `}
    >
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 sm:h-12 sm:w-12">

              <Gauge
                size={25}
              />

            </div>

            <div>

              <h1 className="text-xl font-black sm:text-2xl">
                ADMIN DASHBOARD
              </h1>

              <p
                className={`
                  text-xs
                  font-semibold

                  sm:text-sm

                  ${
                    isDark
                      ? 'text-cyan-200/60'
                      : 'text-blue-700'
                  }
                `}
              >
                Equipment Downtime Monitoring
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <ThemeToggle
              isDark={isDark}
              onToggle={
                toggleTheme
              }
            />

            <button
              type="button"
              onClick={openAdd}
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-cyan-300
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                px-4
                py-3
                text-xs
                font-black
                text-white
                shadow-lg
                shadow-blue-500/25
                transition
                hover:from-blue-500
                hover:to-cyan-400

                sm:flex-none
                sm:text-sm
              "
            >
              <Plus
                size={18}
              />

              ADD EQUIPMENT
            </button>

          </div>

        </div>

        <div
          className={`
            mb-5
            rounded-2xl
            border-2
            p-4
            shadow-lg

            ${panelClass}
          `}
        >
          <div className="mb-4 flex items-center gap-2">

            <Timer
              size={18}
              className="text-cyan-500"
            />

            <h2 className="font-black">
              DATE RANGE SUMMARY
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

            <label>

              <span className="mb-1 block text-xs font-black uppercase text-slate-500">
                Start Date
              </span>

              <input
                type="date"
                value={
                  startDate
                }
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
                className={`
                  w-full
                  rounded-xl
                  border-2
                  px-3
                  py-3
                  text-sm
                  font-bold
                  outline-none
                  focus:border-cyan-500

                  ${inputClass}
                `}
              />

            </label>

            <label>

              <span className="mb-1 block text-xs font-black uppercase text-slate-500">
                End Date
              </span>

              <input
                type="date"
                value={
                  endDate
                }
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
                className={`
                  w-full
                  rounded-xl
                  border-2
                  px-3
                  py-3
                  text-sm
                  font-bold
                  outline-none
                  focus:border-cyan-500

                  ${inputClass}
                `}
              />

            </label>

            <button
              type="button"
              onClick={() =>
                loadSummary()
              }
              disabled={loading}
              className="
                flex
                items-center
                justify-center
                gap-2
                self-end
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                px-4
                py-3
                font-black
                text-white
                disabled:opacity-50
              "
            >
              <Search
                size={17}
              />

              {loading
                ? 'LOADING'
                : 'APPLY'}
            </button>

            <button
              type="button"
              onClick={() =>
                setRange(
                  getToday(),
                  getToday()
                )
              }
              className={`
                self-end
                rounded-xl
                border-2
                px-3
                py-3
                text-sm
                font-black

                ${inputClass}
              `}
            >
              TODAY
            </button>

            <div className="grid grid-cols-2 gap-2 self-end">

              <button
                type="button"
                onClick={() =>
                  setRange(
                    getWeekStart(),
                    getToday()
                  )
                }
                className={`
                  rounded-xl
                  border-2
                  px-2
                  py-3
                  text-xs
                  font-black

                  ${inputClass}
                `}
              >
                WEEK
              </button>

              <button
                type="button"
                onClick={() =>
                  setRange(
                    getMonthStart(),
                    getToday()
                  )
                }
                className={`
                  rounded-xl
                  border-2
                  px-2
                  py-3
                  text-xs
                  font-black

                  ${inputClass}
                `}
              >
                MONTH
              </button>

            </div>

          </div>

          {error && (
            <div className="mt-4 rounded-xl border-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500">
              {error}
            </div>
          )}

        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

          <SummaryCard
            title="Total Equipment"
            value={
              equipmentDaily.length ||
              summary?.totalEquipment ||
              0
            }
            subtitle="Masterlist"
            isDark={isDark}
            icon={
              <Wrench
                size={21}
              />
            }
          />

          <SummaryCard
            title="Operational"
            value={
              operationalCount
            }
            subtitle={`Bacao: ${bacaoOperationalCount} • Enlin: ${enlinOperationalCount}`}
            type="operational"
            isDark={isDark}
            icon={
              <CheckCircle2
                size={21}
              />
            }
          />

          <SummaryCard
            title="Down"
            value={
              downCount
            }
            subtitle={`Bacao: ${bacaoDownCount} • Enlin: ${enlinDownCount}`}
            type="down"
            isDark={isDark}
            icon={
              <AlertTriangle
                size={21}
              />
            }
          />

          <SummaryCard
            title="Operational Time"
            value={formatDuration(
              summary
                ?.totalOperationalTimeMs
            )}
            subtitle="Selected Range"
            type="operational"
            isDark={isDark}
            icon={
              <Clock3
                size={21}
              />
            }
          />

          <SummaryCard
            title="Downtime"
            value={formatDuration(
              summary
                ?.totalDowntimeMs
            )}
            subtitle="Selected Range"
            type="down"
            isDark={isDark}
            icon={
              <Timer
                size={21}
              />
            }
          />

          <SummaryCard
            title="Standby Time"
            value={formatDuration(
              summary
                ?.totalStandbyTimeMs
            )}
            subtitle={`Bacao: ${bacaoStandbyCount} • Enlin: ${enlinStandbyCount}`}
            type="standby"
            isDark={isDark}
            icon={
              <Moon
                size={21}
              />
            }
          />

        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">

          <div>

            <h2 className="text-xl font-black sm:text-2xl">
              EQUIPMENT DAILY STATUS
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Previous day and current day RT / DT monitoring
            </p>

          </div>

          {dailyLoading && (
            <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-500">
              UPDATING...
            </div>
          )}

        </div>

        <div className="mb-10">

          <LocationSection
            location="Bacao"
            items={bacao}
            onEdit={openEdit}
            isDark={isDark}
          />

        </div>

        <div className="mb-6">

          <LocationSection
            location="Enlin"
            items={enlin}
            onEdit={openEdit}
            isDark={isDark}
          />

        </div>

      </div>

      <EquipmentModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        setForm={setForm}
        busy={modalBusy}
        error={modalError}
        onClose={closeModal}
        onSave={
          saveEquipment
        }
        isDark={isDark}
      />

    </div>
  );
}