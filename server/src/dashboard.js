import express from 'express';
import db from './firebase.js';

const router = express.Router();

const TIME_ZONE = 'Asia/Manila';

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

function getManilaDateString(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);

  const year =
    parts.find((part) => part.type === 'year')?.value;

  const month =
    parts.find((part) => part.type === 'month')?.value;

  const day =
    parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

function getManilaMidnight(dateString) {
  return new Date(
    `${dateString}T00:00:00+08:00`
  ).getTime();
}

function shiftDate(dateString, days) {
  const date = new Date(
    `${dateString}T00:00:00+08:00`
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return getManilaDateString(date);
}

function overlapDuration(
  start,
  end,
  rangeStart,
  rangeEnd
) {
  const actualStart =
    Math.max(
      Number(start),
      Number(rangeStart)
    );

  const actualEnd =
    Math.min(
      Number(end),
      Number(rangeEnd)
    );

  if (
    !Number.isFinite(actualStart) ||
    !Number.isFinite(actualEnd) ||
    actualEnd <= actualStart
  ) {
    return 0;
  }

  return actualEnd - actualStart;
}

function emptyTotals() {
  return {
    runtimeMs: 0,
    downtimeMs: 0,
    standbyMs: 0,
  };
}

function addStatusDuration(
  totals,
  status,
  duration
) {
  if (!duration || duration <= 0) {
    return;
  }

  if (status === 'operational') {
    totals.runtimeMs += duration;
  }

  if (status === 'down') {
    totals.downtimeMs += duration;
  }

  if (status === 'standby') {
    totals.standbyMs += duration;
  }
}

/*
|--------------------------------------------------------------------------
| CALCULATE RANGE FOR ONE EQUIPMENT
|--------------------------------------------------------------------------
*/

function calculateEquipmentRange({
  equipment,
  history,
  rangeStart,
  rangeEnd,
  now,
}) {
  const totals =
    emptyTotals();

  /*
  |--------------------------------------------------------------------------
  | COMPLETED HISTORY
  |--------------------------------------------------------------------------
  */

  Object.values(
    history || {}
  ).forEach((record) => {
    if (!record) {
      return;
    }

    const startedAt =
      Number(record.startedAt);

    const endedAt =
      Number(record.endedAt);

    if (
      !startedAt ||
      !endedAt
    ) {
      return;
    }

    const duration =
      overlapDuration(
        startedAt,
        endedAt,
        rangeStart,
        rangeEnd
      );

    addStatusDuration(
      totals,
      record.status,
      duration
    );
  });

  /*
  |--------------------------------------------------------------------------
  | CURRENT ACTIVE STATUS
  |--------------------------------------------------------------------------
  */

  const statusStartedAt =
    Number(
      equipment.statusStartedAt
    );

  if (statusStartedAt) {
    const effectiveEnd =
      Math.min(
        now,
        rangeEnd
      );

    const duration =
      overlapDuration(
        statusStartedAt,
        effectiveEnd,
        rangeStart,
        rangeEnd
      );

    addStatusDuration(
      totals,
      equipment.currentStatus,
      duration
    );
  }

  return totals;
}

/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

router.get(
  '/summary',
  async (req, res) => {
    try {
      const {
        startDate,
        endDate,
      } = req.query;

      if (
        !startDate ||
        !endDate
      ) {
        return res
          .status(400)
          .json({
            message:
              'startDate and endDate are required.',
          });
      }

      const rangeStart =
        getManilaMidnight(
          startDate
        );

      const nextDay =
        shiftDate(
          endDate,
          1
        );

      const rangeEnd =
        getManilaMidnight(
          nextDay
        );

      if (
        rangeEnd <=
        rangeStart
      ) {
        return res
          .status(400)
          .json({
            message:
              'End date cannot be earlier than start date.',
          });
      }

      const now =
        Date.now();

      const [
        equipmentSnapshot,
        historySnapshot,
      ] =
        await Promise.all([
          db
            .ref('equipment')
            .once('value'),

          db
            .ref('history')
            .once('value'),
        ]);

      const equipmentData =
        equipmentSnapshot.val() ||
        {};

      const historyData =
        historySnapshot.val() ||
        {};

      const entries =
        Object.entries(
          equipmentData
        );

      const totals =
        emptyTotals();

      entries.forEach(
        ([key, equipment]) => {
          const result =
            calculateEquipmentRange({
              equipment,

              history:
                historyData[key] ||
                {},

              rangeStart,
              rangeEnd,
              now,
            });

          totals.runtimeMs +=
            result.runtimeMs;

          totals.downtimeMs +=
            result.downtimeMs;

          totals.standbyMs +=
            result.standbyMs;
        }
      );

      const equipmentList =
        entries.map(
          ([, value]) => value
        );

      res.json({
        startDate,
        endDate,

        totalEquipment:
          equipmentList.length,

        operational:
          equipmentList.filter(
            (item) =>
              item.currentStatus ===
              'operational'
          ).length,

        down:
          equipmentList.filter(
            (item) =>
              item.currentStatus ===
              'down'
          ).length,

        standby:
          equipmentList.filter(
            (item) =>
              item.currentStatus ===
              'standby'
          ).length,

        totalOperationalTimeMs:
          totals.runtimeMs,

        totalDowntimeMs:
          totals.downtimeMs,

        totalStandbyTimeMs:
          totals.standbyMs,
      });
    } catch (error) {
      console.error(
        'DASHBOARD SUMMARY ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Failed to generate dashboard summary.',
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| EQUIPMENT DAILY STATUS
|--------------------------------------------------------------------------
|
| Previous Day:
| 0000H -> 2400H
|
| Current Day:
| 0000H -> Current Time
|--------------------------------------------------------------------------
*/

router.get(
  '/equipment-daily',
  async (req, res) => {
    try {
      const now =
        Date.now();

      const today =
        getManilaDateString();

      const yesterday =
        shiftDate(
          today,
          -1
        );

      const tomorrow =
        shiftDate(
          today,
          1
        );

      const yesterdayStart =
        getManilaMidnight(
          yesterday
        );

      const todayStart =
        getManilaMidnight(
          today
        );

      const tomorrowStart =
        getManilaMidnight(
          tomorrow
        );

      const [
        equipmentSnapshot,
        historySnapshot,
      ] =
        await Promise.all([
          db
            .ref('equipment')
            .once('value'),

          db
            .ref('history')
            .once('value'),
        ]);

      const equipmentData =
        equipmentSnapshot.val() ||
        {};

      const historyData =
        historySnapshot.val() ||
        {};

      const result =
        Object.entries(
          equipmentData
        ).map(
          ([
            firebaseKey,
            equipment,
          ]) => {
            const history =
              historyData[
                firebaseKey
              ] || {};

            const previousDay =
              calculateEquipmentRange({
                equipment,
                history,

                rangeStart:
                  yesterdayStart,

                rangeEnd:
                  todayStart,

                now,
              });

            const currentDay =
              calculateEquipmentRange({
                equipment,
                history,

                rangeStart:
                  todayStart,

                rangeEnd:
                  Math.min(
                    now,
                    tomorrowStart
                  ),

                now,
              });

            return {
              key:
                firebaseKey,

              equipmentNo:
                equipment.equipmentNo ||
                firebaseKey.replace(
                  /_/g,
                  ' '
                ),

              equipmentName:
                equipment.equipmentName ||
                equipment.equipmentNo ||
                firebaseKey.replace(
                  /_/g,
                  ' '
                ),

              location:
                equipment.location ||
                '',

              currentStatus:
                equipment.currentStatus ||
                'operational',

              currentRemarks:
                equipment.remarks ||
                '',

              statusStartedAt:
                equipment.statusStartedAt ||
                null,

              previousDay: {
                date:
                  yesterday,

                from:
                  yesterdayStart,

                to:
                  todayStart,

                runtimeMs:
                  previousDay.runtimeMs,

                downtimeMs:
                  previousDay.downtimeMs,

                standbyMs:
                  previousDay.standbyMs,
              },

              currentDay: {
                date:
                  today,

                from:
                  todayStart,

                to:
                  now,

                runtimeMs:
                  currentDay.runtimeMs,

                downtimeMs:
                  currentDay.downtimeMs,

                standbyMs:
                  currentDay.standbyMs,
              },
            };
          }
        );

      console.log(
        `Equipment daily loaded: ${result.length}`
      );

      res.json(
        result
      );
    } catch (error) {
      console.error(
        'EQUIPMENT DAILY ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Failed to load equipment daily statistics.',
      });
    }
  }
);

export default router;