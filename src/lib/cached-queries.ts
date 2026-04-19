import { unstable_cache } from "next/cache";
import { prisma } from "./db";

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ============================================
// Dashboard
// ============================================
export const getDashboardData = unstable_cache(
  async () => {
    const today = getTodayString();
    const [totalChildren, todayAttendance, todayAbsence, checkedOut, recentAnnouncements, activeBroadcasts] = await Promise.all([
      prisma.child.count(),
      prisma.attendance.count({ where: { date: today, checkInTime: { not: null } } }),
      prisma.absenceReport.count({ where: { date: today, type: "ABSENT" } }),
      prisma.attendance.count({ where: { date: today, checkOutTime: { not: null } } }),
      prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3, include: { author: { select: { name: true } } } }),
      prisma.emergencyBroadcast.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    ]);
    return { totalChildren, todayAttendance, todayAbsence, todayPresent: todayAttendance - checkedOut, recentAnnouncements, activeBroadcasts };
  },
  ["dashboard"],
  { revalidate: 15 }
);

// ============================================
// Children (all)
// ============================================
export const getAllChildren = unstable_cache(
  async () => {
    return prisma.child.findMany({ include: { class: true, allergies: true, parents: { include: { parent: true } } }, orderBy: { name: "asc" } });
  },
  ["all-children"],
  { revalidate: 60 }
);

export const getChildrenSimple = unstable_cache(
  async () => {
    return prisma.child.findMany({ include: { class: true }, orderBy: { name: "asc" } });
  },
  ["children-simple"],
  { revalidate: 60 }
);

export const getParentChildren = unstable_cache(
  async (parentId: string) => {
    return prisma.child.findMany({
      where: { parents: { some: { parentId } } },
      include: { class: true, allergies: true, parents: { include: { parent: true } } },
      orderBy: { name: "asc" },
    });
  },
  ["parent-children"],
  { revalidate: 60 }
);

// ============================================
// Timeline
// ============================================
export const getTimelinePosts = unstable_cache(
  async () => {
    return prisma.timelinePost.findMany({
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        images: true,
        comments: { include: { author: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } },
        likes: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },
  ["timeline"],
  { revalidate: 10 }
);

// ============================================
// Attendance
// ============================================
export const getAttendance = unstable_cache(
  async (date: string) => {
    return prisma.attendance.findMany({
      where: { date },
      include: { child: { include: { class: true } } },
      orderBy: { child: { name: "asc" } },
    });
  },
  ["attendance"],
  { revalidate: 10 }
);

// ============================================
// Contact Book
// ============================================
export const getContactBookEntries = unstable_cache(
  async (childId: string, date: string) => {
    return prisma.contactBook.findMany({
      where: { childId, date },
      include: { child: true, author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  ["contact-book"],
  { revalidate: 15 }
);

// ============================================
// Absence
// ============================================
export const getAbsenceReports = unstable_cache(
  async () => {
    return prisma.absenceReport.findMany({
      include: { child: true, parent: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },
  ["absence"],
  { revalidate: 15 }
);

// ============================================
// Announcements
// ============================================
export const getAnnouncements = unstable_cache(
  async (role: string) => {
    return prisma.announcement.findMany({
      where: { OR: [{ targetRole: "ALL" }, { targetRole: role }] },
      include: { author: { select: { name: true, role: true } }, readReceipts: { select: { userId: true } }, _count: { select: { readReceipts: true } } },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
  },
  ["announcements"],
  { revalidate: 30 }
);

// ============================================
// Calendar
// ============================================
export const getEvents = unstable_cache(
  async (monthStr: string) => {
    return prisma.event.findMany({ where: { date: { startsWith: monthStr } }, orderBy: { date: "asc" } });
  },
  ["events"],
  { revalidate: 300 }
);

// ============================================
// Emergency Contacts
// ============================================
export const getEmergencyContacts = unstable_cache(
  async () => {
    return prisma.emergencyContact.findMany({ include: { child: true }, orderBy: [{ childId: "asc" }, { priority: "asc" }] });
  },
  ["emergency-contacts"],
  { revalidate: 120 }
);

export const getPickupPersons = unstable_cache(
  async () => {
    return prisma.pickupPerson.findMany({ include: { child: true }, orderBy: { name: "asc" } });
  },
  ["pickup-persons"],
  { revalidate: 120 }
);

// ============================================
// Photos
// ============================================
export const getPhotoAlbums = unstable_cache(
  async () => {
    return prisma.photoAlbum.findMany({
      include: { photos: true, createdBy: { select: { name: true } }, _count: { select: { photos: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  ["photos"],
  { revalidate: 60 }
);

// ============================================
// Health
// ============================================
export const getHealthRecords = unstable_cache(
  async (childId?: string) => {
    const where = childId ? { childId } : {};
    return prisma.healthRecord.findMany({
      where, include: { child: true, recordedBy: { select: { name: true } } }, orderBy: { date: "desc" }, take: 100,
    });
  },
  ["health"],
  { revalidate: 30 }
);

// ============================================
// Nap Check
// ============================================
export const getNapChecks = unstable_cache(
  async (date: string) => {
    return prisma.napCheck.findMany({
      where: { date }, include: { child: true, checkedBy: { select: { name: true } } }, orderBy: [{ date: "desc" }, { time: "desc" }],
    });
  },
  ["nap-checks"],
  { revalidate: 10 }
);

// ============================================
// Shifts
// ============================================
export const getShifts = unstable_cache(
  async (monthStr: string, teacherId?: string) => {
    const where: Record<string, unknown> = { date: { startsWith: monthStr } };
    if (teacherId) where.teacherId = teacherId;
    return prisma.shift.findMany({ where, include: { teacher: { select: { id: true, name: true } } }, orderBy: [{ date: "asc" }, { startTime: "asc" }] });
  },
  ["shifts"],
  { revalidate: 60 }
);

export const getTeachers = unstable_cache(
  async () => {
    return prisma.user.findMany({ where: { role: "TEACHER" }, select: { id: true, name: true } });
  },
  ["teachers"],
  { revalidate: 300 }
);

// ============================================
// Broadcasts
// ============================================
export const getBroadcasts = unstable_cache(
  async () => {
    return prisma.emergencyBroadcast.findMany({ include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 });
  },
  ["broadcasts"],
  { revalidate: 10 }
);

// ============================================
// Users (admin)
// ============================================
export const getAllUsers = unstable_cache(
  async () => {
    return prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true }, orderBy: { createdAt: "desc" } });
  },
  ["users"],
  { revalidate: 60 }
);
