# Equipment Downtime Monitoring

Stack: React + Tailwind CSS + Express.js + Node.js + Firebase Realtime Database.

## Included equipment
- Bacao: RS 01, RS 03, ECH 06
- Enlin: ECH 07, ECH 08

## Main behavior
- Regular User page requires Location + Equipment + Remarks before action.
- First click starts downtime.
- Second click ends downtime and returns equipment to Operational.
- Timers are based on Firebase timestamps, not browser-only counters, so closing the app does not stop the timer.
- Every status period is written to `statusHistory` before the equipment changes status.
- Admin page has Daily / Weekly / Monthly inquiry totals and live equipment status.
- Standby is supported in dashboard aggregation, but the requested User flow only toggles Operational ↔ Down, so Standby remains 0 unless another process records standby status.

## Firebase structure
```
equipment/
  RS 01/
    equipmentNo
    equipmentName
    location
    currentStatus
    statusStartedAt
    remarks
statusHistory/
  -pushId/
    equipmentNo
    location
    status
    startedAt
    endedAt
    durationMs
    remarks
    changedRemarks
```

## Setup
1. Create a Firebase Realtime Database project.
2. In Firebase Console > Project settings > Service accounts, generate a private key.
3. Copy `server/.env.example` to `server/.env` and fill in the Firebase values.
4. Copy `client/.env.example` to `client/.env`.
5. Install dependencies:
   - root: `npm install`
   - `npm run install:all`
6. Start both apps: `npm run dev`
7. User page: `http://localhost:5173/#user`
8. Admin page: `http://localhost:5173/#admin`

## Production note
For production, add authentication/role checking before exposing the Admin dashboard or write endpoints.
