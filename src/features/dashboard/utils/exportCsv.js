export function exportDashboardCsv(data, filename = 'zaylo-dashboard.csv') {
  if (!data) return

  const lines = [
    ['Metric', 'Value'],
    ['Range', data.range?.key || ''],
    ['From', data.range?.from || ''],
    ['To', data.range?.to || ''],
    ['Total Revenue', data.totalRevenue ?? 0],
    ['Active Orders', data.activeOrders ?? 0],
    ['Cancelled Orders', data.cancelledOrders ?? 0],
    ['Pending Dealers', data.pendingDealers ?? 0],
    ['Approved Dealers', data.approvedDealers ?? 0],
    ['Pending Bulk Quotes', data.pendingBulk ?? 0],
    ['New Contacts', data.newContacts ?? 0],
    [],
    ['Revenue Series Label', 'Value'],
    ...(data.revenueSeries || []).map((p) => [p.label, p.value]),
    [],
    ['Stock Category', 'Units'],
    ...Object.entries(data.stockByCategory || {}).map(([k, v]) => [k, v]),
    [],
    ['Order Status', 'Count'],
    ...(data.orderStatusBreakdown || []).map((p) => [p.name, p.value]),
  ]

  const csv = lines
    .map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
