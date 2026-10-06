import { listLeads } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await listLeads();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Retailer inquiries</h1>
      <p className="mt-1 text-sm text-brand-800/60">
        {leads.length} inquiries from the public “Become a retailer” form. Each
        one also emailed you a copy.
      </p>

      <div className="mt-6 space-y-4">
        {leads.length === 0 ? (
          <div className="card p-8 text-center text-brand-800/50">
            No inquiries yet.
          </div>
        ) : (
          leads.map((l) => (
            <div key={l.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-brand-900">{l.businessName}</h3>
                  <p className="text-sm text-brand-800/70">
                    {l.contactName} · {l.email}
                    {l.phone ? ` · ${l.phone}` : ""}
                  </p>
                </div>
                <span className="text-xs text-brand-800/50">
                  {new Date(l.createdAt).toLocaleString("en-US")}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-brand-800/70">
                {l.businessType && <span>Type: {l.businessType}</span>}
                {l.location && <span>Location: {l.location}</span>}
                {l.website && (
                  <a href={l.website} className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {l.website}
                  </a>
                )}
              </div>
              {l.message && (
                <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-800/80">
                  {l.message}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <a href={`mailto:${l.email}`} className="btn-outline text-xs">
                  Reply by email
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
