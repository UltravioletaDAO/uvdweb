export async function getInactiveUsers() {
  const response = await fetch("/db/purge.json");

  if (!response.ok) {
    throw new Error("Error fetching inactive users");
  }

  const data = await response.json();
  return data;
}
