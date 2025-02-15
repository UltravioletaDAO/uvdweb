export async function getCourses() {
  const response = await fetch("/db/courses.json");

  if (!response.ok) {
    throw new Error("Error fetching courses");
  }

  const data = await response.json();
  return data;
}
