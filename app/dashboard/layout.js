// src/app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <section className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {children}
    </section>
  );
}
