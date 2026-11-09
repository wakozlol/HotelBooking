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
illustrative hotel card. Guests pay at the hotel. Real room types and inventory
must be entered by an administrator.
