import ManagementPage from "../components/ManagementPage";

const data = [
  { id: "REP-1001", type: "Payment Issue", reporter: "Ahmed Ali", other: "Omar Kareem", project: "E-commerce Website", description: "Payment problem", date: "2026-09-10", status: "Pending" },
  { id: "REP-1002", type: "Service Issue", reporter: "Sara Khalid", other: "Ali Hassan", project: "Mobile App UI", description: "Service does not match", date: "2026-09-11", status: "In Review" },
  { id: "REP-1003", type: "Fraud", reporter: "Fatima Abbas", other: "Noor Jasim", project: "Brand Identity", description: "Suspicious activity", date: "2026-09-12", status: "Resolved" },
  { id: "REP-1004", type: "Delay", reporter: "Laith Adnan", other: "Sara Khalid", project: "Blog Writing", description: "Project delivery delay", date: "2026-09-13", status: "Pending" },
  { id: "REP-1005", type: "Other", reporter: "Noor Jasim", other: "Fatima Abbas", project: "Logo Design", description: "Complaint", date: "2026-09-14", status: "Resolved" },
];

export default function Reports() {
  return <ManagementPage
    title="Reports & Disputes"
    subtitle="Manage complaints and reported issues"
    searchPlaceholder="Search reports..."
    filterOptions={["All", "Pending", "In Review", "Resolved"]}
    initialData={data}
    searchKeys={["id", "type", "reporter", "other", "project", "description", "status"]}
    columns={[
      { key: "id", label: "Report" },
      { key: "type", label: "Problem Type" },
      { key: "reporter", label: "Reporter" },
      { key: "other", label: "Other Party" },
      { key: "project", label: "Project" },
      { key: "description", label: "Description" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", badge: true },
    ]}
    fields={[
      { key: "id", label: "Report Number" },
      { key: "type", label: "Problem Type" },
      { key: "reporter", label: "Reporter" },
      { key: "other", label: "Other Party" },
      { key: "project", label: "Project" },
      { key: "description", label: "Description" },
      { key: "date", label: "Report Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Pending", "In Review", "Resolved"] },
    ]}
    extraActions={[
      { label: "Resolve", onClick: (item) => window.alert(`Report ${item.id} selected`) }
    ]}
  />;
}