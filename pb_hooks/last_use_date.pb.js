/// <reference path="../pb_data/types.d.ts" />

// Helper function to update user's last_use_date based on their most recent tracking entry
function updateUserLastUseDate(userId) {
    if (!userId) return;

    try {
        // Find the most recent tracking entry for this user
        const records = $app.dao().findRecordsByFilter(
            "tracking_entries",
            `user = {:userId}`,
            "-date",  // Sort by date descending
            1,        // Limit to 1
            0,        // Offset
            { userId: userId }
        );

        let lastUseDate = null;
        if (records && records.length > 0) {
            lastUseDate = records[0].get("date");
        }

        // Update the user's last_use_date field
        const user = $app.dao().findRecordById("users", userId);
        if (user) {
            user.set("last_use_date", lastUseDate);
            $app.dao().saveRecord(user);
        }
    } catch (e) {
        console.log("Error updating last_use_date:", e);
    }
}

// After creating a tracking entry, update the user's last_use_date
onRecordAfterCreateSuccess((e) => {
    const userId = e.record.get("user");
    updateUserLastUseDate(userId);
}, "tracking_entries");

// After updating a tracking entry, update the user's last_use_date
onRecordAfterUpdateSuccess((e) => {
    const userId = e.record.get("user");
    updateUserLastUseDate(userId);
}, "tracking_entries");

// After deleting a tracking entry, update the user's last_use_date
onRecordAfterDeleteSuccess((e) => {
    const userId = e.record.get("user");
    updateUserLastUseDate(userId);
}, "tracking_entries");
