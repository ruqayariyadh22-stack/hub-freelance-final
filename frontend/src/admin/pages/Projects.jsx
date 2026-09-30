import ManagementPage from "../components/ManagementPage";

const data = [
  { id: 1, title: "E-commerce Website", client: "Ahmed Ali", budget: "$500", deadline: "2026-10-15", offers: 12, freelancer: "Omar Kareem", status: "Active" },
  { id: 2, title: "Mobile App UI", client: "Sara Khalid", budget: "$300", deadline: "2026-10-20", offers: 8, freelancer: "Ali Hassan", status: "In Progress" },
  { id: 3, title: "Brand Identity", client: "Fatima Abbas", budget: "$450", deadline: "2026-09-05", offers: 15, freelancer: "Noor Jasim", status: "Completed" },
  { id: 4, title: "Blog Writing", client: "Laith Adnan", budget: "$150", deadline: "2026-09-30", offers: 6, freelancer: "Sara Khalid", status: "In Progress" },
  { id: 5, title: "Logo Design", client: "Noor Jasim", budget: "$120", deadline: "2026-09-10", offers: 10, freelancer: "Fatima Abbas", status: "Completed" },
];

export default function Projects() {
  return <ManagementPage
    title="Projects Management"
    subtitle="Manage client projects and freelancers"
    addLabel=" Add Project"
    searchPlaceholder="Search projects..."
    filterOptions={["All", "Active", "In Progress", "Completed"]}
    initialData={data}
    searchKeys={["title", "client", "freelancer", "status"]}
    columns={[
      { key: "title", label: "Project" },
      { key: "client", label: "Client" },
      { key: "budget", label: "Budget" },
      { key: "deadline", label: "Deadline" },
      { key: "offers", label: "Offers" },
      { key: "freelancer", label: "Freelancer" },
      { key: "status", label: "Status", badge: true },
    ]}
    fields={[
      { key: "title", label: "Project Title" },
      { key: "client", label: "Client" },
      { key: "budget", label: "Budget" },
      { key: "deadline", label: "Deadline", type: "date" },
      { key: "offers", label: "Number of Offers", type: "number" },
      { key: "freelancer", label: "Selected Freelancer" },
      { key: "status", label: "Status", type: "select", options: ["Active", "In Progress", "Completed"] },
    ]}
  />;
}