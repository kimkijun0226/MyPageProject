import { readFileSync } from "fs";

const ref = process.env.SUPABASE_REFERENCE_ID;
const token = process.env.SUPABASE_ACCESS_TOKEN;
const file = process.argv[2];

if (!ref || !token || !file) {
  console.error("Usage: node --env-file=.env scripts/apply-sql-file.mjs <sql-file>");
  process.exit(1);
}

const query = readFileSync(file, "utf8");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
});

const body = await res.json();
if (!res.ok) {
  console.error("FAILED", res.status, JSON.stringify(body));
  process.exit(1);
}

console.log("OK", JSON.stringify(body).slice(0, 500));
