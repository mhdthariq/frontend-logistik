// Adapt existing rendering fixtures to the server pagination contract.
// API query construction and database filtering have separate hook/integration tests.
export async function mockPagedGet(get: (path: string) => Promise<unknown>, path: string) {
  const url = new URL(path, "http://test");
  const legacy = new URLSearchParams();
  if (url.searchParams.get("history") === "true") legacy.set("history", "true");
  if (url.searchParams.get("mine") === "true") legacy.set("mine", "true");
  const original = await get(url.pathname + (legacy.size ? `?${legacy}` : ""));
  const rows = (original as Record<string, any>[]).filter(row => {
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("customerType");
    const mode = url.searchParams.get("fulfillmentMode");
    const warehouse = url.searchParams.get("warehouseId");
    const q = (url.searchParams.get("search") ?? "").trim().toLowerCase();
    return (!status || row.status === status) && (!type || row.customer?.type === type) &&
      (!mode || (row.fulfillmentMode ?? "STANDARD") === mode) &&
      (!warehouse || row.gudangIds?.includes(Number(warehouse))) &&
      (!q || [row.masterCode, row.transportCode, row.pickupCode, row.deliveryCode, row.invoiceNumber, row.customerName, row.customer?.name, row.customer?.companyName, row.penerimaName, row.routeName, row.vehicleNumber, row.origin, row.destination, row.driverName, row.kenekName].some(value => String(value ?? "").toLowerCase().includes(q)));
  });
  const pageSize = Number(url.searchParams.get("pageSize") ?? 25);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Number(url.searchParams.get("page") ?? 1), pages);
  const statuses: Record<string, number> = {};
  for (const row of rows) statuses[row.status] = (statuses[row.status] ?? 0) + 1;
  return { data: rows.slice((page - 1) * pageSize, page * pageSize), meta: { page, pageSize, pages, total: rows.length, statuses, unpriced: rows.filter(row => row.priceAmount == null && row.status !== "CANCELLED").length } };
}
