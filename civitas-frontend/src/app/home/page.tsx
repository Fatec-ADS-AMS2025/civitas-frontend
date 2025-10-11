import Sidebar from "@/components/Sidebar/sidebar";

export default function Page() {
  return (
    <div className="flex">
      <Sidebar activeKey="home" />
      <main className="flex-1"></main>
    </div>
  );
}
