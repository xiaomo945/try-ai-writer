import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUnreadReminders,
  getAllReminders,
  markReminderAsRead,
  markAllRemindersAsRead,
  recordUserActivity,
} from "@/lib/retention/reminder-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Record user activity
    await recordUserActivity(session.user.id);

    const reminders = unreadOnly
      ? await getUnreadReminders(session.user.id)
      : await getAllReminders(session.user.id);

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Get reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, reminderId } = body;

    if (action === "mark_read" && reminderId) {
      const reminder = await markReminderAsRead(reminderId);
      if (!reminder) {
        return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
      }
      return NextResponse.json({ reminder });
    }

    if (action === "mark_all_read") {
      await markAllRemindersAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update reminder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
