import ManagementPage from "../components/ManagementPage";

const data = [
  { id: 1, reviewer: "Ahmed Ali", freelancer: "Omar Kareem", service: "Website Design", rating: 5, comment: "Excellent work", date: "2026-09-10", status: "Published" },
  { id: 2, reviewer: "Sara Khalid", freelancer: "Ali Hassan", service: "Web Development", rating: 4, comment: "Very good service", date: "2026-09-11", status: "Published" },
  { id: 3, reviewer: "Fatima Abbas", freelancer: "Noor Jasim", service: "Brand Identity", rating: 2, comment: "Needs improvement", date: "2026-09-12", status: "Flagged" },
  { id: 4, reviewer: "Laith Adnan", freelancer: "Sara Khalid", service: "Content Writing", rating: 5, comment: "Great experience", date: "2026-09-13", status: "Published" },
  { id: 5, reviewer: "Noor Jasim", freelancer: "Fatima Abbas", service: "Logo Design", rating: 3, comment: "Average", date: "2026-09-14", status: "Pending" },
];

export default function Reviews() {
  return <ManagementPage
    title="Reviews & Comments"
    subtitle="Monitor ratings and user comments"
    searchPlaceholder="Search reviews..."
    filterOptions={["All", "Published", "Pending", "Flagged"]}
    initialData={data}
    searchKeys={["reviewer", "freelancer", "service", "comment", "status"]}
    columns={[
      { key: "reviewer", label: "Reviewer" },
      { key: "freelancer", label: "Freelancer" },
      { key: "service", label: "Service" },
      { key: "rating", label: "Rating", render: (value) => <span className="review-stars">{"★".repeat(Number(value))}{"☆".repeat(5 - Number(value))}</span> },
      { key: "comment", label: "Comment" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", badge: true },
    ]}
    fields={[
      { key: "reviewer", label: "Reviewer" },
      { key: "freelancer", label: "Freelancer" },
      { key: "service", label: "Service" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "comment", label: "Comment" },
      { key: "date", label: "Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Published", "Pending", "Flagged"] },
    ]}
  />;
}