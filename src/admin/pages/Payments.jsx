import ManagementPage from "../components/ManagementPage";

const data = [
  { id: "PAY-2001", client: "Ahmed Ali", freelancer: "Omar Kareem", project: "E-commerce Website", amount: "$500", commission: "$50", due: "$450", status: "Paid", date: "2026-09-10", transfer: "Transferred" },
  { id: "PAY-2002", client: "Sara Khalid", freelancer: "Ali Hassan", project: "Mobile App UI", amount: "$300", commission: "$30", due: "$270", status: "Pending", date: "2026-09-14", transfer: "Pending" },
  { id: "PAY-2003", client: "Fatima Abbas", freelancer: "Noor Jasim", project: "Brand Identity", amount: "$450", commission: "$45", due: "$405", status: "Paid", date: "2026-09-05", transfer: "Transferred" },
  { id: "PAY-2004", client: "Laith Adnan", freelancer: "Sara Khalid", project: "Blog Writing", amount: "$150", commission: "$15", due: "$135", status: "Paid", date: "2026-09-12", transfer: "Transferred" },
  { id: "PAY-2005", client: "Noor Jasim", freelancer: "Fatima Abbas", project: "Logo Design", amount: "$120", commission: "$12", due: "$108", status: "Refunded", date: "2026-09-01", transfer: "Refunded" },
];

export default function Payments() {
  return <ManagementPage
    title="Payments & Commissions"
    subtitle="Monitor payments and platform commissions"
    searchPlaceholder="Search payments..."
    filterOptions={["All", "Paid", "Pending", "Refunded"]}
    initialData={data}
    searchKeys={["id", "client", "freelancer", "project", "status", "transfer"]}
    columns={[
      { key: "id", label: "Transaction" },
      { key: "client", label: "Client" },
      { key: "freelancer", label: "Freelancer" },
      { key: "project", label: "Project" },
      { key: "amount", label: "Amount" },
      { key: "commission", label: "Commission" },
      { key: "due", label: "Freelancer Due" },
      { key: "status", label: "Status", badge: true },
      { key: "transfer", label: "Transfer" },
    ]}
    fields={[
      { key: "id", label: "Transaction Number" },
      { key: "client", label: "Client" },
      { key: "freelancer", label: "Freelancer" },
      { key: "project", label: "Project" },
      { key: "amount", label: "Gross Amount" },
      { key: "commission", label: "Platform Commission" },
      { key: "due", label: "Freelancer Due" },
      { key: "status", label: "Payment Status", type: "select", options: ["Paid", "Pending", "Refunded"] },
      { key: "date", label: "Transaction Date", type: "date" },
      { key: "transfer", label: "Transfer Status", type: "select", options: ["Transferred", "Pending", "Refunded"] },
    ]}
    extraActions={[
      { label: "Track", onClick: (item) => window.alert(`Tracking payment ${item.id}`) }
    ]}
  />;
}