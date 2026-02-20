# Release Notes

## v0.1.0 - 2026-02-20

What's included:
- Initial app scaffold and UI
- `FancyToggle` — modern, large wall-switch style toggle
- `ScheduleList` — add/edit/delete on/off schedules (date+time)
- `TimerControl` — set a countdown to send ON/OFF after N minutes
- Automatic device state sync (`/status`), retry after toggle, polling every 5s
- Footer branding: "powered by WeMakIT Smart-socket 237"

How to use:
1. Update `ESP_IP` in `app/(tabs)/index.tsx` to your device IP.
2. Use the big wall switch to toggle power.
3. Add schedules under "Schedule On/Off" to run ON/OFF at specific date/time.
4. Use the "Timer" panel to run ON/OFF after a set number of minutes.

Notes for the device firmware:
- The app expects these GET endpoints on the device (replace path if different):
  - `GET /status` — returns `ON`/`OFF` or `1`/`0` (case-insensitive)
  - `GET /on` — turn socket on
  - `GET /off` — turn socket off

Development:
- Expo-compatible; uses only React Native components (no incompatible native modules)
- TypeScript-checked; run `npx tsc --noEmit` and `npm run start` to run locally

Changelog:
- See git commits for full history.
