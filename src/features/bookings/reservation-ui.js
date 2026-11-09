import { isSampleRoomType } from "./sample-inventory.js";

const money = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export function nightsBetween(start, end) {
  return (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000;
}

export function detailsList(entries) {
  const list = document.createElement("dl");
  list.className = "row mb-0";
  for (const [label, value] of entries) {
    const term = document.createElement("dt");
    term.className = "col-sm-5";
    term.textContent = label;
    const description = document.createElement("dd");
    description.className = "col-sm-7";
    description.textContent = String(value);
    list.append(term, description);
  }
  return list;
}

export function reservationDetails(reservation) {
  return detailsList([
    ["Booking reference", reservation.id],
    ["Hotel", reservation.hotel_name],
    ["Room type", reservation.room_type_name ?? "Room"],
    ["Assigned room", reservation.room_number],
    ["Check-in", reservation.check_in],
    ["Check-out", reservation.check_out],
    ["Guests", reservation.guest_count],
    ["Nights", nightsBetween(reservation.check_in, reservation.check_out)],
    ["Price per night", money.format(Number(reservation.nightly_rate))],
    ["Total", money.format(Number(reservation.total_eur))],
    ["Status", reservation.status],
    ["Payment", isSampleRoomType(reservation.room_type_name) ? "Test only - no payment" : "Pay at the hotel"],
  ]);
}

export { money };
