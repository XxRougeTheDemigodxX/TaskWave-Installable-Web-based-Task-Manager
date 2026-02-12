// 1. Registeration
if ("serviceWorker" in navigator) {
window.addEventListener("load", () => {
		navigator.serviceWorker.register("/service-worker.js");
	});
}


// Push Notifications
// Always ask the user for permission when called (e.g. when they click Enable Notifications)
async function requestNotificationPermission() {
	if (!("Notification" in window)) return false;

	const permission = await Notification.requestPermission();
	if (permission === "granted") return true;
	return false;
}

// Notification Toggler in UI
document.addEventListener("DOMContentLoaded", () => {
	const toggle = document.getElementById("switchCheckChecked");
	if (!toggle) return;

	// Load saved notification preference from localStorage
	const savedPreference = localStorage.getItem("notificationsEnabled");
	if (savedPreference === "true") {
		toggle.checked = true;
	}

	toggle.addEventListener("change", async (e) => {
		const isEnabled = e.target.checked;

		// Save preference to localStorage
		localStorage.setItem("notificationsEnabled", isEnabled ? "true" : "false");
		document.querySelector("form-switch").innerText += isEnabled ? "Notifications Enabled" : "Notifications Disabled";

		// When user turns notifications ON, request permission
		if (isEnabled) {
			const permission = await requestNotificationPermission();
			if (!permission) {
				// Keep toggle checked so the checkbox doesn't "flash" back off on mobile.
				// Notifications will only fire when permission is granted; tell the user.
				window.dispatchEvent(new CustomEvent("notificationPermissionDenied"));
			}
		}
	});
});



function sendNotification(taskTitle, taskId) {
    // Respect the toggle in the UI
    const toggle = document.getElementById("switchCheckChecked");
    if (!toggle || !toggle.checked) return;

    // Only try to show a notification if permissions are granted
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;

        const option = {
            body: `Task Reminder: ${taskTitle}`,
            icon: "../images/logo.png",
            vibrate: [200, 100, 200],
            tag: "notification-tag",
            actions: [
                { action: "open", title: "Open Task" },
                { action: "close", title: "Dismiss" }
            ],
            data: taskId
        };

        reg.showNotification("Task overdue", option);
    });
}