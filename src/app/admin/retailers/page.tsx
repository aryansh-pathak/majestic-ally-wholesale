import { listRetailers } from "@/lib/admin";
import { CreateRetailer } from "./create-retailer";
import { RetailerActions } from "./retailer-actions";

export const dynamic = "force-dynamic";

export default async function AdminRetailersPage() {
  const retailers = await listRetailers();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Retailers</h1>
          <p className="mt-1 text-sm text-brand-800/60">
            {retailers.length} accounts. Only you can create logins — the public
            form just sends you a lead.
          </p>
        </div>
        <CreateRetailer />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-800/60">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-center">Pricing</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {retailers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-800/50">
                  No retailer accounts yet. Add your first one above.
                </td>
              </tr>
            ) : (
              retailers.map((r) => (
                <tr key={r.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-900">{r.businessName}</div>
                    {r.name && <div className="text-xs text-brand-800/50">{r.name}</div>}
                  </td>
                  <td className="px-4 py-3 text-brand-800/70">{r.email}</td>
                  <td className="px-4 py-3 text-center">
                    {r.accountDiscountPct != null ? (
                      <span className="badge bg-saddle/15 text-saddle-dark">
                        {r.accountDiscountPct}% flat
                      </span>
                    ) : (
                      <span className="text-xs text-brand-800/50">Standard tiers</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.status === "active" ? (
                      <span className="badge bg-brand-100 text-brand-700">Active</span>
                    ) : (
                      <span className="badge bg-red-100 text-red-700">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RetailerActions
                      id={r.id}
                      status={r.status}
                      businessName={r.businessName}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
