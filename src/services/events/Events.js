export async function getEvents() {
    const response = await fetch("/db/events.json");
    
    if (!response.ok) {
        throw new Error("Error fetching events");
    }
    
    const data = await response.json();
    return data;
}