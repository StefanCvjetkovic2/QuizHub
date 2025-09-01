import http from "./http";

// public rute za kategorije (Controller: [Route("api/Categories")])
const BASE = "/Categories";

/**
 * Vraća kategorije za filter. Podrazumijevano onlyUsed=true (kao u kontroleru).
 * @param {{onlyUsed?: boolean}=} opts
 */
export async function listPublicCategories(opts = { onlyUsed: true }) {
  const params = {};
  if (typeof opts?.onlyUsed === "boolean") params.onlyUsed = opts.onlyUsed;

  // VAŽNO: ruta u C# je "api/Categories" (veliko C), pa držimo baš "/Categories"
  const { data } = await http.get(BASE, { params });

  // očekuje {id, name}
  return Array.isArray(data) ? data.map(x => ({ id: x.id, name: x.name })) : [];
}
