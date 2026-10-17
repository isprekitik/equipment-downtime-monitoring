import express from 'express';
import db from './firebase.js';

const router = express.Router();

function equipmentKey(equipmentNo) {
  return String(equipmentNo)
    .trim()
    .replace(/\s+/g, '_');
}

/*
|--------------------------------------------------------------------------
| GET ALL EQUIPMENT
|--------------------------------------------------------------------------
*/

router.get('/', async (req, res) => {
  try {
    const snapshot = await db
      .ref('equipment')
      .once('value');

    const data =
      snapshot.val() || {};

    const equipment =
      Object.values(data);

    res.json(equipment);
  } catch (error) {
    console.error(
      'GET EQUIPMENT ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to load equipment.',
    });
  }
});


/*
|--------------------------------------------------------------------------
| ADD EQUIPMENT
|--------------------------------------------------------------------------
*/

router.post('/add', async (req, res) => {
  try {
    const equipmentName =
      req.body.equipmentName?.trim();

    const location =
      req.body.location?.trim();

    if (!equipmentName || !location) {
      return res.status(400).json({
        message:
          'Equipment name and location are required.',
      });
    }

    if (
      !['Bacao', 'Enlin'].includes(
        location
      )
    ) {
      return res.status(400).json({
        message:
          'Invalid equipment location.',
      });
    }

    const equipmentNo =
      equipmentName.toUpperCase();

    const key =
      equipmentKey(
        equipmentNo
      );

    const ref =
      db.ref(
        `equipment/${key}`
      );

    const snapshot =
      await ref.once(
        'value'
      );

    if (snapshot.exists()) {
      return res.status(409).json({
        message:
          'Equipment already exists.',
      });
    }

    const now =
      Date.now();

    const equipment = {
      equipmentNo,
      equipmentName,
      location,

      currentStatus:
        'operational',

      statusStartedAt:
        now,

      remarks: '',

      createdAt:
        now,

      updatedAt:
        now,
    };

    await ref.set(
      equipment
    );

    res.status(201).json(
      equipment
    );
  } catch (error) {
    console.error(
      'ADD EQUIPMENT ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to add equipment.',
    });
  }
});


/*
|--------------------------------------------------------------------------
| EDIT EQUIPMENT
|--------------------------------------------------------------------------
*/

router.put(
  '/:equipmentNo',
  async (req, res) => {
    try {
      const oldEquipmentNo =
        decodeURIComponent(
          req.params.equipmentNo
        );

      const equipmentName =
        req.body.equipmentName?.trim();

      const location =
        req.body.location?.trim();

      if (
        !equipmentName ||
        !location
      ) {
        return res
          .status(400)
          .json({
            message:
              'Equipment name and location are required.',
          });
      }

      if (
        !['Bacao', 'Enlin'].includes(
          location
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Invalid equipment location.',
          });
      }

      const oldKey =
        equipmentKey(
          oldEquipmentNo
        );

      const oldRef =
        db.ref(
          `equipment/${oldKey}`
        );

      const snapshot =
        await oldRef.once(
          'value'
        );

      if (!snapshot.exists()) {
        return res
          .status(404)
          .json({
            message:
              'Equipment not found.',
          });
      }

      const oldEquipment =
        snapshot.val();

      const newEquipmentNo =
        equipmentName.toUpperCase();

      const newKey =
        equipmentKey(
          newEquipmentNo
        );

      /*
      |--------------------------------------------------------------------------
      | SAME KEY
      |--------------------------------------------------------------------------
      */

      if (oldKey === newKey) {
        const updated = {
          ...oldEquipment,

          equipmentNo:
            newEquipmentNo,

          equipmentName,

          location,

          updatedAt:
            Date.now(),
        };

        await oldRef.set(
          updated
        );

        return res.json(
          updated
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK NEW EQUIPMENT NAME
      |--------------------------------------------------------------------------
      */

      const newRef =
        db.ref(
          `equipment/${newKey}`
        );

      const newSnapshot =
        await newRef.once(
          'value'
        );

      if (newSnapshot.exists()) {
        return res
          .status(409)
          .json({
            message:
              'Another equipment with that name already exists.',
          });
      }

      const updated = {
        ...oldEquipment,

        equipmentNo:
          newEquipmentNo,

        equipmentName,

        location,

        updatedAt:
          Date.now(),
      };

      /*
      |--------------------------------------------------------------------------
      | COPY HISTORY
      |--------------------------------------------------------------------------
      */

      const historySnapshot =
        await db
          .ref(
            `history/${oldKey}`
          )
          .once('value');

      const statusHistorySnapshot =
        await db
          .ref(
            `statusHistory/${oldKey}`
          )
          .once('value');

      const updates = {};

      updates[
        `equipment/${newKey}`
      ] = updated;

      updates[
        `equipment/${oldKey}`
      ] = null;

      if (
        historySnapshot.exists()
      ) {
        const history =
          historySnapshot.val();

        Object.keys(
          history
        ).forEach((id) => {
          history[id].equipmentNo =
            newEquipmentNo;

          history[id].equipmentName =
            equipmentName;

          history[id].location =
            location;
        });

        updates[
          `history/${newKey}`
        ] = history;

        updates[
          `history/${oldKey}`
        ] = null;
      }

      if (
        statusHistorySnapshot.exists()
      ) {
        const logs =
          statusHistorySnapshot.val();

        Object.keys(
          logs
        ).forEach((id) => {
          logs[id].equipmentNo =
            newEquipmentNo;

          logs[id].equipmentName =
            equipmentName;

          logs[id].location =
            location;
        });

        updates[
          `statusHistory/${newKey}`
        ] = logs;

        updates[
          `statusHistory/${oldKey}`
        ] = null;
      }

      await db
        .ref()
        .update(
          updates
        );

      res.json(
        updated
      );
    } catch (error) {
      console.error(
        'EDIT EQUIPMENT ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Failed to edit equipment.',
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| START / END DOWNTIME
|--------------------------------------------------------------------------
*/

router.post(
  '/:equipmentNo/toggle-downtime',
  async (req, res) => {
    try {
      const equipmentNo =
        decodeURIComponent(
          req.params.equipmentNo
        );

      const remarks =
        req.body.remarks?.trim() ||
        '';

      const key =
        equipmentKey(
          equipmentNo
        );

      const equipmentRef =
        db.ref(
          `equipment/${key}`
        );

      const snapshot =
        await equipmentRef.once(
          'value'
        );

      if (!snapshot.exists()) {
        return res
          .status(404)
          .json({
            message:
              'Equipment not found.',
          });
      }

      const equipment =
        snapshot.val();

      const now =
        Date.now();

      const currentStatus =
        equipment.currentStatus ||
        'operational';

      /*
      |--------------------------------------------------------------------------
      | REMARKS REQUIRED ONLY WHEN STARTING DOWNTIME
      |--------------------------------------------------------------------------
      */

      if (
        currentStatus !==
          'down' &&
        !remarks
      ) {
        return res
          .status(400)
          .json({
            message:
              'Remarks are required when starting downtime.',
          });
      }

      const newStatus =
        currentStatus ===
        'down'
          ? 'operational'
          : 'down';

      /*
      |--------------------------------------------------------------------------
      | SAVE PREVIOUS STATUS TO HISTORY
      |--------------------------------------------------------------------------
      */

      if (
        equipment.statusStartedAt &&
        equipment.statusStartedAt >
          0
      ) {
        const durationMs =
          now -
          equipment.statusStartedAt;

        await db
          .ref(
            `history/${key}`
          )
          .push({
            equipmentNo:
              equipment.equipmentNo,

            equipmentName:
              equipment.equipmentName ||
              equipment.equipmentNo,

            location:
              equipment.location,

            status:
              currentStatus,

            startedAt:
              equipment.statusStartedAt,

            endedAt:
              now,

            durationMs,

            remarks:
              equipment.remarks ||
              '',

            createdAt:
              now,
          });
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE CURRENT STATUS
      |--------------------------------------------------------------------------
      */

      const updatedEquipment = {
        ...equipment,

        currentStatus:
          newStatus,

        statusStartedAt:
          now,

        remarks:
          newStatus === 'down'
            ? remarks
            : '',

        updatedAt:
          now,
      };

      await equipmentRef.set(
        updatedEquipment
      );

      /*
      |--------------------------------------------------------------------------
      | ACTION LOG
      |--------------------------------------------------------------------------
      */

      await db
        .ref(
          `statusHistory/${key}`
        )
        .push({
          equipmentNo:
            equipment.equipmentNo,

          equipmentName:
            equipment.equipmentName ||
            equipment.equipmentNo,

          location:
            equipment.location,

          action:
            newStatus === 'down'
              ? 'START DOWNTIME'
              : 'END DOWNTIME',

          status:
            newStatus,

          remarks,

          timestamp:
            now,
        });

      res.json(
        updatedEquipment
      );
    } catch (error) {
      console.error(
        'TOGGLE DOWNTIME ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Failed to update equipment status.',
      });
    }
  }
);

export default router;