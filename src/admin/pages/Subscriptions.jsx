import ManagementPage from "../components/ManagementPage";

const data = [
  { id: 1, freelancer: "Omar Kareem", plan: "Professional", price: "$29", start: "2026-09-01", end: "2026-10-01", status: "Active", payment: "Paid" },
  { id: 2, freelancer: "Sara Khalid", plan: "Premium", price: "$49", start: "2026-08-20", end: "2026-09-20", status: "Active", payment: "Paid" },
  { id: 3, freelancer: "Ali Hassan", plan: "Basic", price: "$15", start: "2026-07-01", end: "2026-08-01", status: "Expired", payment: "Paid" },
  { id: 4, freelancer: "Noor Jasim", plan: "Premium", price: "$49", start: "2026-09-05", end: "2026-10-05", status: "Active", payment: "Paid" },
  { id: 5, freelancer: "Fatima Abbas", plan: "Professional", price: "$29", start: "2026-06-01", end: "2026-07-01", status: "Cancelled", payment: "Refunded" },
];

export default function Subscriptions() {
  return <ManagementPage
    title="Subscriptions"
    subtitle="Manage freelancer paid subscriptions"
    addLabel=" Add Subscription"
    searchPlaceholder="Search subscriptions..."
    filterOptions={["All", "Active", "Expired", "Cancelled"]}
    initialData={data}
    searchKeys={["freelancer", "plan", "status", "payment"]}
    columns={[
      { key: "freelancer", label: "Freelancer" },
      { key: "plan", label: "Plan" },
      { key: "price", label: "Price" },
      { key: "start", label: "Start" },
      { key: "end", label: "End" },
      { key: "status", label: "Status", badge: true },
      { key: "payment", label: "Payment" },
    ]}
    fields={[
      { key: "freelancer", label: "Freelancer" },
      { key: "plan", label: "Subscription Plan", type: "select", options: ["Basic", "Professional", "Premium"] },
      { key: "price", label: "Price" },
      { key: "start", label: "Start Date", type: "date" },
      { key: "end", label: "End Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Expired", "Cancelled"] },
      { key: "payment", label: "Payment Status", type: "select", options: ["Paid", "Pending", "Refunded"] },
    ]}
  />;
}