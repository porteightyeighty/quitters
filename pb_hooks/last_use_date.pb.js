/// <reference path="../pb_data/types.d.ts" />

// After creating a tracking entry
onRecordAfterCreateSuccess((e) => {
  const userId = e.record.get("user");
  if (!userId) return;

  try {
    const records = $app.findRecordsByFilter(
      "tracking_entries",
      `user = "${userId}" && type != "nicotine_replacement"`,
      "-date",
      1
    );

    const lastUseDate = records.length > 0 ? records[0].get("date") : null;

    const user = $app.findRecordById("users", userId);
    if (user) {
      user.set("last_use_date", lastUseDate);
      $app.save(user);
    }
  } catch (err) {
    console.log("Error updating last_use_date:", err);
  }
}, "tracking_entries");

// After updating a tracking entry
onRecordAfterUpdateSuccess((e) => {
  const userId = e.record.get("user");
  if (!userId) return;

  try {
    const records = $app.findRecordsByFilter(
      "tracking_entries",
      `user = "${userId}"`,
      "-date",
      1
    );

    const lastUseDate = records.length > 0 ? records[0].get("date") : null;

    const user = $app.findRecordById("users", userId);
    if (user) {
      user.set("last_use_date", lastUseDate);
      $app.save(user);
    }
  } catch (err) {
    console.log("Error updating last_use_date:", err);
  }
}, "tracking_entries");

// After deleting a tracking entry
onRecordAfterDeleteSuccess((e) => {
  const userId = e.record.get("user");
  if (!userId) return;

  try {
    const records = $app.findRecordsByFilter(
      "tracking_entries",
      `user = "${userId}"`,
      "-date",
      1
    );

    const lastUseDate = records.length > 0 ? records[0].get("date") : null;

    const user = $app.findRecordById("users", userId);
    if (user) {
      user.set("last_use_date", lastUseDate);
      $app.save(user);
    }
  } catch (err) {
    console.log("Error updating last_use_date:", err);
  }
}, "tracking_entries");
