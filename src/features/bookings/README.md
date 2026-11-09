# Bookings

Own availability search criteria, reservation UI, booking details/history/status, and cancellation requests. Each reservation is for one physical room; use an atomic database operation and constraints to prevent overlapping active reservations.

The hotel details modal starts with today and tomorrow in UTC and automatically
checks `list_room_offers` when opened and after valid date or guest changes.
The selected offer is saved in session storage while a guest signs in.
`/booking/` displays the selection
and confirms via the idempotent `confirm_room_booking` RPC, which rechecks the
selected physical room and price atomically. `/my-bookings/` shows
the current guest's reservations and uses `cancel_my_reservation` for eligible
cancellations. The database enforces the 24-hour UTC cutoff, ownership, price,
room assignment and overlap exclusion. Rates come from physical rooms, not the
illustrative hotel card. For real stays guests pay at the hotel. Real room types
and inventory must be entered by an administrator.

The optional development seed creates room types prefixed
`SAMPLE TEST ONLY - NO HOTEL STAY - `. The booking and reservation pages mark
these as test reservations without payment. This naming convention must be
preserved while sample inventory is in use; never use the prefix for real rooms.

An empty offer result is checked against the published hotel before reporting
that it has no active room types. The interface distinguishes an empty room
inventory, no availability, access denial and connection failures. Diagnostic
console messages include operation, status and error code, not guest details.
