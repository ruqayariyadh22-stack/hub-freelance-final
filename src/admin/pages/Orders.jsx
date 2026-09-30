import ManagementPage from "../components/ManagementPage";

const data = [
  { id: "ORD-1001", client: "Ahmed Ali", freelancer: "Omar Kareem", project: "E-commerce Website", value: "$500", commission: "$50", status: "In Progress", payment: "Paid" },
  { id: "ORD-1002", client: "Sara Khalid", freelancer: "Ali Hassan", project: "Mobile App UI", value: "$300", commission: "$30", status: "Pending", payment: "Pending" },
  { id: "ORD-1003", client: "Fatima Abbas", freelancer: "Noor Jasim", project: "Brand Identity", value: "$450", commission: "$45", status: "Completed", payment: "Paid" },
  { id: "ORD-1004", client: "Laith Adnan", freelancer: "Sara Khalid", project: "Blog Writing", value: "$150", commission: "$15", status: "In Progress", payment: "Paid" },
  { id: "ORD-1005", client: "Noor Jasim", freelancer: "Fatima Abbas", project: "Logo Design", value: "$120", commission: "$12", status: "Cancelled", payment: "Refunded" },
];

export default function Orders() {
  return <ManagementPage
    title="Orders & Contracts"
    subtitle="Track projects, orders and contracts"
    searchPlaceholder="Search orders..."
    filterOptions={["All", "Pending", "In Progress", "Completed", "Cancelled"]}
    initialData={data}
    searchKeys={["id", "client", "freelancer", "project", "status", "payment"]}
    columns={[
      { key: "id", label: "Order" },
      { key: "client", label: "Client" },
      { key: "freelancer", label: "Freelancer" },
      { key: "project", label: "Project" },
      { key: "value", label: "Value" },
      { key: "commission", label: "Commission" },
      { key: "status", label: "Status", badge: true },
      { key: "payment", label: "Payment" },
    ]}
    fields={[
      { key: "id", label: "Order Number" },
      { key: "client", label: "Client" },
      { key: "freelancer", label: "Freelancer" },
      { key: "project", label: "Project" },
      { key: "value", label: "Project Value" },
      { key: "commission", label: "Commission" },
      { key: "status", label: "Status", type: "select", options: ["Pending", "In Progress", "Completed", "Cancelled"] },
      { key: "payment", label: "Payment Status", type: "select", options: ["Paid", "Pending", "Refunded"] },
    ]}
    extraActions={[
      { label: "Track", onClick: (item) => window.alert(`Tracking ${item.id}`) }
    ]}
  />;
}