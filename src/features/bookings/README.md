# Bookings

Own availability search criteria, reservation UI, booking details/history/status, and cancellation requests. Each reservation is for one physical room; use an atomic database operation and constraints to prevent overlapping active reservations.

The hotel details modal checks availability through `list_available_rooms` and
confirms a selected room through `book_room`. Rates come from physical rooms,
not the illustrative hotel card. Guests must sign in and pay at the hotel.
Room inventory must be entered by an administrator; history and cancellation
screens are not yet implemented.
