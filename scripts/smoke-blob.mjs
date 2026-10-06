import { put, del } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token || token.includes("SENSITIVE")) {
  console.error("BLOB_FAIL: token vacío o placeholder");
  process.exit(1);
}

const pathname = `smoke/${Date.now()}.txt`;
const blob = await put(pathname, "smoke-ok", {
  access: "private",
  token,
  contentType: "text/plain",
});
console.log("BLOB_PUT_OK", blob.pathname || pathname);
await del(blob.url, { token });
console.log("BLOB_DEL_OK");
