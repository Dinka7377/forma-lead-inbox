
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  checkPin,
  isInboxAuthorized,
  setInboxSession,
  clearInboxSession,
} from "@/lib/inbox-auth";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  industry: string;
  revenue: string;
  goal: string;
  ai_opening: string | null;
  status: string;
  ai_score: string | null;
  ai_reason: string | null;
  created_at: string;
};

const statuses = [
  "Jauns",
  "Piezvanīts",
  "Tikšanās norunāta",
  "Nav aktuāls",
];

function database() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("Supabase configuration missing");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function login(formData: FormData) {
  "use server";

  const pin = String(formData.get("pin") ?? "");

  if (!checkPin(pin)) {
    redirect("/inbox?error=1");
  }

  await setInboxSession();
  redirect("/inbox");
}

async function logout() {
  "use server";

  await clearInboxSession();
  redirect("/inbox");
}

async function updateStatus(formData: FormData) {
  "use server";

  if (!(await isInboxAuthorized())) {
    throw new Error("Unauthorized");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (
    !/^[0-9a-f-]{36}$/i.test(id) ||
    !statuses.includes(status)
  ) {
    throw new Error("Invalid data");
  }

  const { error } = await database()
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error("Status update failed");

  redirect("/inbox");
}

function elapsed(date: string) {
  const minutes = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(date).getTime()) / 60000
    )
  );

  if (minutes < 1) return "Tikko";
  if (minutes < 60) return `Pirms ${minutes} min`;
  if (minutes < 1440)
    return `Pirms ${Math.floor(minutes / 60)} h`;

  return new Date(date).toLocaleDateString("lv-LV");
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authorized = await isInboxAuthorized();
  const params = await searchParams;

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#eceee7] flex items-center justify-center p-5">
        <div className="bg-white p-10 w-full max-w-md shadow-sm">
          <p className="text-xs tracking-[3px] text-[#84907b]">
            FORMA / PRIVATE WORKSPACE
          </p>

          <h1 className="text-4xl font-semibold mt-8 mb-3">
            Lead Inbox
          </h1>

          <p className="text-gray-500 mb-8">
            Ievadi PIN kodu, lai apskatītu pieteikumus.
          </p>

          <form action={login} className="space-y-5">
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6,}"
              required
              placeholder="PIN kods"
              className="w-full border border-gray-300 p-4 outline-none focus:border-[#53604b]"
            />

            {params.error && (
              <p className="text-red-600 text-sm">
                Nepareizs PIN kods.
              </p>
            )}

            <button className="w-full bg-[#354333] text-white p-4 cursor-pointer">
              Atvērt Inbox →
            </button>
          </form>
        </div>
      </main>
    );
  }

  const { data, error } = await database()
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10">
        Neizdevās ielādēt pieteikumus.
      </main>
    );
  }

  const leads = (data ?? []) as Lead[];

  return (
    <main className="min-h-screen bg-[#f6f6f1] text-[#252c25]">
      <header className="bg-white px-6 md:px-12 py-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <p className="text-2xl font-bold tracking-tight">
            FORMA<span className="text-[#9aa78c]">.</span>
          </p>
          <p className="text-xs text-gray-500 tracking-widest mt-1">
            LEAD INBOX
          </p>
        </div>

        <form action={logout}>
          <button className="text-sm border border-gray-300 px-5 py-3 cursor-pointer">
            Iziet
          </button>
        </form>
      </header>

      <div className="max-w-6xl mx-auto p-5 md:p-10">
        <div className="flex justify-between items-end mb-9 gap-4">
          <div>
            <p className="text-xs tracking-[2px] text-[#7c8b73] mb-3">
              SALES WORKSPACE
            </p>
            <h1 className="text-4xl md:text-5xl font-medium">
              Jaunie pieteikumi.
            </h1>
          </div>

          <span className="text-sm text-gray-500">
            {leads.length} kopā
          </span>
        </div>

        <div className="space-y-5">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="bg-white border border-[#e1e5db] p-5 md:p-7"
            >
              <div className="flex flex-wrap justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {lead.name}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {lead.company} · {lead.industry}
                  </p>
                </div>

                <span className="text-sm text-gray-500">
                  {elapsed(lead.created_at)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    MĒNEŠA APGROZĪJUMS
                  </p>
                  <p className="font-medium">{lead.revenue}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    AI NOVĒRTĒJUMS
                  </p>
                  <p className="font-medium">
                    {lead.ai_score ?? "Gaida novērtējumu"}
                  </p>
                  {lead.ai_reason && (
                    <p className="text-sm text-gray-500 mt-1">
                      {lead.ai_reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#f4f5f0] p-4 mb-5">
                <p className="text-xs text-gray-500 mb-2">
                  KLIENTA MĒRĶIS
                </p>
                <p>{lead.goal}</p>
              </div>

              {lead.ai_opening && (
                <div className="bg-[#e8eee5] p-4 mb-5">
                  <p className="text-xs text-[#65785f] mb-2">
                    ✨ AI IETEIKUMS SARUNAI
                  </p>
                  <p className="text-sm leading-relaxed">
                    {lead.ai_opening}
                  </p>
                </div>
              )}


              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}
                    className="bg-[#435640] text-white px-5 py-3 text-sm"
                  >
                    ☎ Zvanīt
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    className="border border-gray-300 px-5 py-3 text-sm"
                  >
                    E-pasts
                  </a>
                </div>

                <form action={updateStatus}>
                  <input type="hidden" name="id" value={lead.id} />

                  <select
                    name="status"
                    defaultValue={lead.status}
                    className="border border-gray-300 p-3 text-sm bg-white"
                  >
                    {statuses.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="bg-[#e7ebe2] px-4 py-3 text-sm cursor-pointer ml-2"
                  >
                    Saglabāt
                  </button>
                </form>
              </div>
            </article>
          ))}

          {leads.length === 0 && (
            <div className="bg-white p-12 text-center text-gray-500">
              Pagaidām nav pieteikumu.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
