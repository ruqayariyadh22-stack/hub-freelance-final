import ManagementPage from "../components/ManagementPage";

const data = [
  { id: 1, name: "Ahmed Ali", email: "ahmed@gmail.com", type: "Client", status: "Active" },
  { id: 2, name: "Sara Khalid", email: "sara@gmail.com", type: "Freelancer", status: "Active" },
  { id: 3, name: "Ali Hassan", email: "ali@gmail.com", type: "Client", status: "Blocked" },
  { id: 4, name: "Noor Jasim", email: "noor@gmail.com", type: "Freelancer", status: "Active" },
  { id: 5, name: "Omar Kareem", email: "omar@gmail.com", type: "Freelancer", status: "Pending" },
  { id: 6, name: "Fatima Abbas", email: "fatima@gmail.com", type: "Client", status: "Active" },
  { id: 7, name: "Laith Adnan", email: "laith@gmail.com", type: "Freelancer", status: "Active" },
  { id: 8, name: "Rania Saad", email: "rania@gmail.com", type: "Client", status: "Blocked" },
];

export default function Users() {
  return <ManagementPage
    title="Users Management"
    subtitle="Manage clients and freelancers accounts"
    addLabel=" Add User"
    searchPlaceholder="Search users..."
    filterOptions={["All", "Client", "Freelancer"]}
    initialData={data}
    searchKeys={["name", "email", "type", "status"]}
    columns={[
      { key: "name", label: "User" },
      { key: "email", label: "Email" },
      { key: "type", label: "Account Type" },
      { key: "status", label: "Status", badge: true },
    ]}
    fields={[
      { key: "name", label: "Name" },
      { key: "email", label: "Email", type: "email" },
      { key: "type", label: "Account Type", type: "select", options: ["Client", "Freelancer"] },
      { key: "status", label: "Status", type: "select", options: ["Active", "Pending", "Blocked"] },
    ]}
    filterKey="type"
  />;
}