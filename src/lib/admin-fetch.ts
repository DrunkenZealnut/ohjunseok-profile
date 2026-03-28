export function adminHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("admin_token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function adminGet(params: string) {
  const res = await fetch(`/api/admin/data?${params}`, {
    headers: adminHeaders(),
  });
  if (res.status === 401) {
    sessionStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  return res.json();
}

export async function adminPost(body: unknown) {
  const res = await fetch("/api/admin/data", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function adminPut(body: unknown) {
  const res = await fetch("/api/admin/data", {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function adminDelete(table: string, id: string) {
  const res = await fetch(`/api/admin/data?table=${table}&id=${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  return res.json();
}
