import ManagementPage from "../components/ManagementPage";

const data = [
  { id: 1, name: "Website Design", freelancer: "Omar Kareem", category: "Design", price: "$250", delivery: "5 Days", status: "Active" },
  { id: 2, name: "Logo Design", freelancer: "Sara Khalid", category: "Design", price: "$80", delivery: "3 Days", status: "Pending" },
  { id: 3, name: "Web Development", freelancer: "Ali Hassan", category: "Development", price: "$500", delivery: "10 Days", status: "Active" },
  { id: 4, name: "Content Writing", freelancer: "Noor Jasim", category: "Writing", price: "$120", delivery: "4 Days", status: "Rejected" },
  { id: 5, name: "SEO Optimization", freelancer: "Fatima Abbas", category: "Marketing", price: "$180", delivery: "7 Days", status: "Active" },
  { id: 6, name: "Social Media Design", freelancer: "Laith Adnan", category: "Design", price: "$150", delivery: "5 Days", status: "Pending" },
];

export default function Services() {
  return <ManagementPage
    title="Services Management"
    subtitle="Manage freelancer services"
    addLabel=" Add Service"
    searchPlaceholder="Search services..."
    filterOptions={["All", "Active", "Pending", "Rejected"]}
    initialData={data}
    searchKeys={["name", "freelancer", "category", "status"]}
    columns={[
      { key: "name", label: "Service" },
      { key: "freelancer", label: "Freelancer" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "delivery", label: "Delivery" },
      { key: "status", label: "Status", badge: true },
    ]}
    fields={[
      { key: "name", label: "Service Name" },
      { key: "freelancer", label: "Freelancer" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "delivery", label: "Delivery Time" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Pending", "Rejected"] },
    ]}
  />;
}