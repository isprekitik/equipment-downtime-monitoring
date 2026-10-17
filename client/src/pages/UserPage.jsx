import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleStop,
  Clock3,
  MapPin,
  Moon,
  Play,
  RefreshCw,
  Sun,
  Timer,
  Wrench,
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
  const [theme, setTheme] =
    useState(
      getInitialTheme
    );

  useEffect(() => {
    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  return {
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
      title={
        isDark
          ? 'Switch to Light Mode'
          : 'Switch to Dark Mode'
      }
      className={`
        flex
        h-10
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        px-3
        text-xs
        font-black
        transition-all

        sm:h-11
        sm:text-sm

        ${
          isDark
            ? `
                border-slate-600
                bg-slate-800
                text-white
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

          <span className="hidden sm:inline">
            LIGHT
          </span>
        </>
      ) : (
        <>
          <Moon
            size={18}
            className="text-indigo-600"
          />

          <span className="hidden sm:inline">
            DARK
          </span>
        </>
      )}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| CUSTOM DROPDOWN
|--------------------------------------------------------------------------
*/

function CustomDropdown({
  label,
  value,
  placeholder,
  options,
  disabled,
  onChange,
  isDark,
}) {
  const [open, setOpen] =
    useState(false);

  const wrapperRef =
    useRef(null);

  useEffect(() => {
    const closeDropdown = (
      event
    ) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      closeDropdown
    );

    document.addEventListener(
      'touchstart',
      closeDropdown
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        closeDropdown
      );

      document.removeEventListener(
        'touchstart',
        closeDropdown
      );
    };
  }, []);

  const selected =
    options.find(
      (item) =>
        item.value === value
    );

  const display =
    selected?.label ||
    placeholder;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
    >
      <div
        className={`
          mb-1
          px-1
          text-[11px]
          font-black
          uppercase
          tracking-[0.12em]

          sm:text-xs

          ${
            isDark
              ? 'text-slate-300'
              : 'text-slate-600'
          }
        `}
      >
        {label}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(
              (current) =>
                !current
            );
          }
        }}
        className={`
          flex
          h-14
          w-full
          items-center
          gap-3
          rounded-xl
          border-2
          px-4
          text-base
          font-black
          uppercase
          tracking-wide
          outline-none
          transition-all

          sm:h-16
          sm:rounded-2xl
          sm:px-5
          sm:text-xl

          ${
            disabled
              ? isDark
                ? `
                    cursor-not-allowed
                    border-slate-700
                    bg-slate-800
                    text-slate-500
                  `
                : `
                    cursor-not-allowed
                    border-slate-300
                    bg-slate-200
                    text-slate-400
                  `
              : `
                  cursor-pointer
                  border-cyan-300
                  bg-gradient-to-r
                  from-blue-600
                  via-blue-500
                  to-cyan-500
                  text-white
                  shadow-lg
                  shadow-blue-500/25
                  hover:from-blue-500
                  hover:to-cyan-400
                  focus:ring-4
                  focus:ring-cyan-400/25
                `
          }
        `}
      >
        <span className="min-w-0 flex-1 truncate text-center">
          {display}
        </span>

        <ChevronDown
          size={22}
          className={`
            shrink-0
            transition-transform
            duration-200

            ${
              open
                ? 'rotate-180'
                : ''
            }
          `}
        />
      </button>

      {open &&
        !disabled && (
          <div
            className={`
              absolute
              left-0
              right-0
              top-[calc(100%+6px)]
              z-[100]
              max-h-56
              overflow-y-auto
              rounded-xl
              border
              p-1.5
              shadow-2xl

              ${
                isDark
                  ? `
                      border-slate-600
                      bg-[#0b1728]
                      shadow-black/60
                    `
                  : `
                      border-blue-200
                      bg-white
                      shadow-blue-200/50
                    `
              }
            `}
          >
            {options.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm font-bold text-slate-500">
                NO OPTIONS
              </div>
            ) : (
              options.map(
                (item) => {
                  const active =
                    item.value ===
                    value;

                  return (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      onClick={() => {
                        onChange(
                          item.value
                        );

                        setOpen(
                          false
                        );
                      }}
                      className={`
                        mb-1
                        w-full
                        rounded-lg
                        px-4
                        py-3
                        text-center
                        text-base
                        font-black
                        uppercase
                        transition

                        last:mb-0

                        ${
                          active
                            ? `
                                bg-gradient-to-r
                                from-blue-600
                                to-cyan-500
                                text-white
                              `
                            : isDark
                            ? `
                                text-slate-100
                                hover:bg-slate-800
                              `
                            : `
                                text-slate-800
                                hover:bg-blue-50
                              `
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  );
                }
              )
            )}
          </div>
        )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| USER PAGE
|--------------------------------------------------------------------------
*/

export default function UserPage() {
  const {
    isDark,
    toggleTheme,
  } = useAppTheme();

  const [
    equipment,
    setEquipment,
  ] = useState([]);

  const [
    location,
    setLocation,
  ] = useState('');

  const [
    equipmentNo,
    setEquipmentNo,
  ] = useState('');

  const [
    remarks,
    setRemarks,
  ] = useState('');

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    messageType,
    setMessageType,
  ] = useState('');

  /*
  |--------------------------------------------------------------------------
  | LOAD EQUIPMENT
  |--------------------------------------------------------------------------
  */

  const loadEquipment =
    async () => {
      try {
        setLoading(true);

        const data =
          await api(
            '/equipment'
          );

        setEquipment(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          'LOAD EQUIPMENT ERROR:',
          error
        );

        setMessage(
          'CANNOT LOAD EQUIPMENT'
        );

        setMessageType(
          'error'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadEquipment();

    const interval =
      setInterval(
        loadEquipment,
        10000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOCATIONS
  |--------------------------------------------------------------------------
  */

  const locations =
    useMemo(() => {
      const values = [
        ...new Set(
          equipment
            .map(
              (item) =>
                item.location
            )
            .filter(Boolean)
        ),
      ];

      const order = [
        'Bacao',
        'Enlin',
      ];

      return values.sort(
        (a, b) => {
          const ai =
            order.indexOf(a);

          const bi =
            order.indexOf(b);

          if (
            ai !== -1 &&
            bi !== -1
          ) {
            return ai - bi;
          }

          if (ai !== -1) {
            return -1;
          }

          if (bi !== -1) {
            return 1;
          }

          return a.localeCompare(
            b
          );
        }
      );
    }, [equipment]);

  const locationOptions =
    useMemo(
      () =>
        locations.map(
          (item) => ({
            value: item,
            label: item,
          })
        ),
      [locations]
    );

  /*
  |--------------------------------------------------------------------------
  | EQUIPMENT
  |--------------------------------------------------------------------------
  */

  const equipmentChoices =
    useMemo(() => {
      if (!location) {
        return [];
      }

      return equipment
        .filter(
          (item) =>
            item.location ===
            location
        )
        .sort(
          (a, b) =>
            (
              a.equipmentName ||
              a.equipmentNo ||
              ''
            ).localeCompare(
              b.equipmentName ||
                b.equipmentNo ||
                ''
            )
        );
    }, [
      equipment,
      location,
    ]);

  const equipmentOptions =
    useMemo(
      () =>
        equipmentChoices.map(
          (item) => ({
            value:
              item.equipmentNo,

            label:
              item.equipmentName ||
              item.equipmentNo,
          })
        ),
      [equipmentChoices]
    );

  /*
  |--------------------------------------------------------------------------
  | SELECTED
  |--------------------------------------------------------------------------
  */

  const selectedEquipment =
    equipmentChoices.find(
      (item) =>
        item.equipmentNo ===
        equipmentNo
    );

  const currentStatus =
    String(
      selectedEquipment
        ?.currentStatus ||
        ''
    ).toLowerCase();

  const isDown =
    currentStatus ===
    'down';

  const isOperational =
    currentStatus ===
    'operational';

  const isStandby =
    currentStatus ===
    'standby';

  const canSubmit =
    Boolean(
      location &&
        equipmentNo &&
        (
          isDown ||
          remarks.trim()
        )
    );

  /*
  |--------------------------------------------------------------------------
  | CHANGE HANDLERS
  |--------------------------------------------------------------------------
  */

  const handleLocationChange =
    (value) => {
      setLocation(value);
      setEquipmentNo('');
      setRemarks('');
      setMessage('');
      setMessageType('');
    };

  const handleEquipmentChange =
    (value) => {
      setEquipmentNo(value);
      setRemarks('');
      setMessage('');
      setMessageType('');
    };

  /*
  |--------------------------------------------------------------------------
  | START / END
  |--------------------------------------------------------------------------
  */

  const handleToggle =
    async () => {
      if (
        !canSubmit ||
        busy
      ) {
        return;
      }

      try {
        setBusy(true);

        setMessage('');
        setMessageType('');

        const updated =
          await api(
            `/equipment/${encodeURIComponent(
              equipmentNo
            )}/toggle-downtime`,
            {
              method:
                'POST',

              body:
                JSON.stringify({
                  remarks:
                    remarks.trim(),

                  location,
                }),
            }
          );

        setEquipment(
          (previous) =>
            previous.map(
              (item) =>
                item.equipmentNo ===
                updated.equipmentNo
                  ? updated
                  : item
            )
        );

        setRemarks('');

        if (
          String(
            updated.currentStatus
          ).toLowerCase() ===
          'down'
        ) {
          setMessage(
            'DOWNTIME STARTED'
          );
        } else {
          setMessage(
            'EQUIPMENT OPERATIONAL'
          );
        }

        setMessageType(
          'success'
        );

        setTimeout(
          loadEquipment,
          300
        );
      } catch (error) {
        setMessage(
          error.message ||
            'FAILED TO UPDATE'
        );

        setMessageType(
          'error'
        );
      } finally {
        setBusy(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        overflow-y-auto
        transition-colors
        duration-300

        lg:h-screen
        lg:overflow-hidden

        ${
          isDark
            ? `
                bg-gradient-to-br
                from-[#06111f]
                via-[#0b1b30]
                to-[#082f49]
                text-white
              `
            : `
                bg-gradient-to-br
                from-sky-50
                via-white
                to-blue-100
                text-slate-900
              `
        }
      `}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

      <div
        className="
          relative
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-3xl
          items-start
          justify-center
          px-3
          py-3

          sm:px-5
          sm:py-4

          lg:h-full
          lg:min-h-0
          lg:items-center
        "
      >
        <div
          className={`
            w-full
            max-w-xl
            rounded-2xl
            border
            p-3
            shadow-2xl
            backdrop-blur-xl

            sm:rounded-[30px]
            sm:p-5

            ${
              isDark
                ? `
                    border-cyan-900/60
                    bg-[#091727]/95
                    shadow-black/50
                  `
                : `
                    border-blue-200
                    bg-white/95
                    shadow-blue-200/50
                  `
            }
          `}
        >
          {/* HEADER */}
          <div className="mb-3 flex items-center justify-between gap-3">

            <div className="flex min-w-0 items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-blue-600
                  to-cyan-500
                  text-white
                  shadow-lg
                  shadow-blue-500/30

                  sm:h-12
                  sm:w-12
                  sm:rounded-2xl
                "
              >
                <Wrench
                  size={24}
                />
              </div>

              <div className="min-w-0">

                <h1 className="truncate text-lg font-black tracking-wide sm:text-2xl">
                  EQUIPMENT CONTROL
                </h1>

                <div
                  className={`
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]

                    sm:text-xs

                    ${
                      isDark
                        ? 'text-cyan-300/70'
                        : 'text-blue-600'
                    }
                  `}
                >
                  Downtime Monitoring
                </div>

              </div>

            </div>

            <ThemeToggle
              isDark={isDark}
              onToggle={
                toggleTheme
              }
            />

          </div>

          {/* STATUS */}
          <div
            className={`
              mb-3
              rounded-xl
              border-2
              px-3
              py-2
              text-center
              text-xs
              font-black
              uppercase
              tracking-wider

              sm:text-sm

              ${
                !selectedEquipment
                  ? isDark
                    ? `
                        border-slate-700
                        bg-slate-950
                        text-slate-400
                      `
                    : `
                        border-slate-300
                        bg-slate-100
                        text-slate-600
                      `
                  : isDown
                  ? isDark
                    ? `
                        border-red-500
                        bg-red-950
                        text-red-200
                      `
                    : `
                        border-red-500
                        bg-red-100
                        text-red-800
                      `
                  : isStandby
                  ? isDark
                    ? `
                        border-amber-400
                        bg-amber-950
                        text-amber-200
                      `
                    : `
                        border-amber-400
                        bg-amber-100
                        text-amber-800
                      `
                  : isDark
                  ? `
                      border-emerald-500
                      bg-emerald-950
                      text-emerald-200
                    `
                  : `
                      border-emerald-500
                      bg-emerald-100
                      text-emerald-800
                    `
              }
            `}
          >
            {!selectedEquipment ? (
              'SELECT AN EQUIPMENT'
            ) : isDown ? (
              <div className="flex items-center justify-center gap-2">

                <AlertTriangle
                  size={18}
                />

                EQUIPMENT DOWN

              </div>
            ) : isStandby ? (
              <div className="flex items-center justify-center gap-2">

                <Clock3
                  size={18}
                />

                EQUIPMENT STANDBY

              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">

                <CheckCircle2
                  size={18}
                />

                EQUIPMENT OPERATIONAL

              </div>
            )}
          </div>

          {/* LIVE TIMER */}
          {selectedEquipment && (
            <div
              className={`
                mb-3
                overflow-hidden
                rounded-2xl
                border-2
                shadow-xl
                transition-all

                ${
                  isDown
                    ? isDark
                      ? `
                          border-red-500
                          bg-gradient-to-br
                          from-red-950
                          via-red-950/80
                          to-rose-950
                          shadow-red-950/50
                        `
                      : `
                          border-red-500
                          bg-gradient-to-br
                          from-red-100
                          to-rose-50
                          shadow-red-200/60
                        `
                    : isStandby
                    ? isDark
                      ? `
                          border-amber-400
                          bg-gradient-to-br
                          from-amber-950
                          to-yellow-950
                          shadow-amber-950/30
                        `
                      : `
                          border-amber-400
                          bg-gradient-to-br
                          from-amber-100
                          to-yellow-50
                          shadow-amber-200/50
                        `
                    : isDark
                    ? `
                        border-emerald-500
                        bg-gradient-to-br
                        from-emerald-950
                        to-teal-950
                        shadow-emerald-950/30
                      `
                    : `
                        border-emerald-500
                        bg-gradient-to-br
                        from-emerald-100
                        to-teal-50
                        shadow-emerald-200/50
                      `
                }
              `}
            >
              <div
                className={`
                  flex
                  items-center
                  justify-center
                  gap-2
                  border-b
                  px-3
                  py-2
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.15em]

                  sm:text-xs

                  ${
                    isDown
                      ? isDark
                        ? `
                            border-red-500/40
                            text-red-300
                          `
                        : `
                            border-red-300
                            text-red-700
                          `
                      : isStandby
                      ? isDark
                        ? `
                            border-amber-500/40
                            text-amber-300
                          `
                        : `
                            border-amber-300
                            text-amber-700
                          `
                      : isDark
                      ? `
                          border-emerald-500/40
                          text-emerald-300
                        `
                      : `
                          border-emerald-300
                          text-emerald-700
                        `
                  }
                `}
              >
                <Timer
                  size={15}
                />

                {isDown
                  ? 'CURRENT DOWNTIME'
                  : isStandby
                  ? 'CURRENT STANDBY TIME'
                  : 'CURRENT OPERATIONAL TIME'}
              </div>

              <div className="relative px-3 py-3 text-center sm:py-4">

                {/* decorative glow */}
                <div
                  className={`
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-16
                    w-40
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    blur-2xl

                    ${
                      isDown
                        ? 'bg-red-500/20'
                        : isStandby
                        ? 'bg-amber-400/20'
                        : 'bg-emerald-400/20'
                    }
                  `}
                />

                <div
                  className={`
                    relative
                    font-mono
                    text-4xl
                    font-black
                    tracking-[0.08em]

                    sm:text-5xl

                    ${
                      isDown
                        ? isDark
                          ? 'text-red-300'
                          : 'text-red-700'
                        : isStandby
                        ? isDark
                          ? 'text-amber-300'
                          : 'text-amber-700'
                        : isDark
                        ? 'text-emerald-300'
                        : 'text-emerald-700'
                    }
                  `}
                >
                  {selectedEquipment.statusStartedAt ? (
                    <LiveTimer
                      startedAt={
                        selectedEquipment.statusStartedAt
                      }
                    />
                  ) : (
                    '00:00:00'
                  )}
                </div>

                <div
                  className={`
                    relative
                    mt-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-widest

                    sm:text-[10px]

                    ${
                      isDark
                        ? 'text-slate-500'
                        : 'text-slate-500'
                    }
                  `}
                >
                  HH : MM : SS
                </div>

              </div>
            </div>
          )}

          {/* LOCATION */}
          <div className="mb-2">

            <CustomDropdown
              label="Location"
              value={location}
              placeholder={
                loading
                  ? 'LOADING...'
                  : 'SELECT LOCATION'
              }
              options={
                locationOptions
              }
              disabled={
                loading
              }
              onChange={
                handleLocationChange
              }
              isDark={
                isDark
              }
            />

          </div>

          {/* EQUIPMENT */}
          <div className="mb-2">

            <CustomDropdown
              label="Equipment"
              value={
                equipmentNo
              }
              placeholder="SELECT EQUIPMENT"
              options={
                equipmentOptions
              }
              disabled={
                !location ||
                loading
              }
              onChange={
                handleEquipmentChange
              }
              isDark={
                isDark
              }
            />

          </div>

          {/* REMARKS */}
          <div className="mb-3">

            <div
              className={`
                mb-1
                px-1
                text-[11px]
                font-black
                uppercase
                tracking-[0.12em]

                ${
                  isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }
              `}
            >
              {isDown
                ? 'Remarks'
                : 'Reason for Down'}
            </div>

            <textarea
              value={
                remarks
              }
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              disabled={
                !selectedEquipment
              }
              placeholder={
                isDown
                  ? 'OPTIONAL REMARKS'
                  : 'REASON FOR DOWN'
              }
              className={`
                h-16
                w-full
                resize-none
                rounded-xl
                border-2
                px-3
                py-2
                text-center
                text-base
                font-black
                uppercase
                outline-none
                transition-all

                sm:h-20
                sm:text-lg

                ${
                  !selectedEquipment
                    ? isDark
                      ? `
                          cursor-not-allowed
                          border-slate-700
                          bg-slate-800
                          text-slate-500
                        `
                      : `
                          cursor-not-allowed
                          border-slate-300
                          bg-slate-200
                          text-slate-400
                        `
                    : `
                        border-cyan-300
                        bg-gradient-to-r
                        from-blue-600
                        to-cyan-500
                        text-white
                        shadow-lg
                        shadow-blue-500/20
                        placeholder:text-blue-100
                        focus:ring-4
                        focus:ring-cyan-400/20
                      `
                }
              `}
            />

          </div>

          {/* START / END */}
          <div className="flex justify-center">

            <button
              type="button"
              onClick={
                handleToggle
              }
              disabled={
                !canSubmit ||
                busy
              }
              className={`
                relative
                flex
                h-32
                w-32
                shrink-0
                items-center
                justify-center
                rounded-full
                border-[6px]
                text-center
                transition-all
                duration-300
                active:scale-95

                min-[400px]:h-36
                min-[400px]:w-36

                sm:h-44
                sm:w-44

                ${
                  !canSubmit ||
                  busy
                    ? isDark
                      ? `
                          cursor-not-allowed
                          border-slate-600
                          bg-slate-700
                          text-slate-500
                        `
                      : `
                          cursor-not-allowed
                          border-slate-300
                          bg-slate-200
                          text-slate-400
                        `
                    : isDown
                    ? `
                        border-red-200
                        bg-gradient-to-br
                        from-red-500
                        via-red-600
                        to-rose-800
                        text-white
                        shadow-[0_0_45px_rgba(239,68,68,0.60)]
                        hover:scale-105
                      `
                    : `
                        border-cyan-200
                        bg-gradient-to-br
                        from-blue-500
                        via-blue-600
                        to-cyan-500
                        text-white
                        shadow-[0_0_45px_rgba(6,182,212,0.55)]
                        hover:scale-105
                      `
                }
              `}
            >
              <div className="pointer-events-none absolute inset-2 rounded-full border-2 border-white/25" />

              {busy ? (
                <div className="relative z-10">

                  <RefreshCw
                    size={34}
                    className="mx-auto animate-spin"
                  />

                  <div className="mt-1 text-base font-black">
                    WAIT
                  </div>

                </div>
              ) : isDown ? (
                <div className="relative z-10">

                  <CircleStop
                    size={38}
                    className="mx-auto"
                  />

                  <div className="mt-1 text-2xl font-black">
                    END
                  </div>

                </div>
              ) : (
                <div className="relative z-10">

                  <Play
                    size={40}
                    className="mx-auto"
                  />

                  <div className="mt-1 text-2xl font-black">
                    START
                  </div>

                </div>
              )}

            </button>

          </div>

          {/* HINT */}
          {selectedEquipment &&
            !isDown &&
            !remarks.trim() && (
              <div className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] font-black uppercase text-amber-500">

                <AlertTriangle
                  size={13}
                />

                ENTER REASON BEFORE PRESSING START

              </div>
            )}

          {/* NOTIFICATION */}
          <div
            className={`
              mt-3
              flex
              min-h-[48px]
              items-center
              justify-center
              rounded-xl
              border-2
              px-3
              text-center
              text-sm
              font-black
              uppercase

              ${
                !message
                  ? isDark
                    ? `
                        border-slate-700
                        bg-black/50
                        text-slate-400
                      `
                    : `
                        border-slate-300
                        bg-slate-100
                        text-slate-600
                      `
                  : messageType ===
                    'success'
                  ? isDark
                    ? `
                        border-emerald-400
                        bg-emerald-950
                        text-emerald-200
                      `
                    : `
                        border-emerald-500
                        bg-emerald-100
                        text-emerald-800
                      `
                  : isDark
                  ? `
                      border-red-500
                      bg-red-950
                      text-red-200
                    `
                  : `
                      border-red-500
                      bg-red-100
                      text-red-800
                    `
              }
            `}
          >
            {message ||
              'SYSTEM READY'}
          </div>

        </div>
      </div>
    </div>
  );
}