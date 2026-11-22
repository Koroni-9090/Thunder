import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  const userId = user ? user.id : 'usr-citizen-1';

  const userNotifs = db.notifications.filter(
    (n) => n.userId === userId || n.userId === user?.email || user?.role === 'admin'
  );

  return NextResponse.json({
    notifications: userNotifs.length > 0 ? userNotifs : db.notifications,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, channel, title, body, bodyUr } = await req.json();

    if (!userId || !channel || !title || !body) {
      return NextResponse.json({ error: 'Missing notification parameters' }, { status: 400 });
    }

    const newNotif = {
      id: `notif-${Date.now()}`,
      userId,
      channel,
      title,
      body,
      bodyUr,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    db.notifications.unshift(newNotif);

    return NextResponse.json({
      message: 'Notification dispatched',
      notification: newNotif,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Notification error', message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, all } = await req.json();

    if (all) {
      db.notifications.forEach((n) => {
        n.isRead = true;
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      const notif = db.notifications.find((n) => n.id === id);
      if (notif) {
        notif.isRead = true;
      }
      return NextResponse.json({ success: true, message: `Notification ${id} marked as read` });
    }

    return NextResponse.json({ error: 'Missing id or all flag' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update notification', message: err.message }, { status: 500 });
  }
}
