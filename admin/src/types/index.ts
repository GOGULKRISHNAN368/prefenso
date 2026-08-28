export type Role = 'ADMIN' | 'WATCHMAN';
export type User = { id: string; name: string; username: string; role: Role; blockId: string | null; blockName?: string | null; isActive: boolean };
export type Block = { id: string; _id?: string; name: string; code: string; displayOrder: number; isActive: boolean; credentialsConfigured: boolean; insideCount: number; watchman: { id: string; name: string; username: string; isActive: boolean } | null };
export type Visitor = { id: string; visitorCode: string; visitorName: string; phoneNumber: string; reasonForVisit: string; personToMeet?: string; blockId: string; block: { id: string; name: string; code: string } | null; checkInAt: string; checkOutAt: string | null; status: 'INSIDE' | 'EXITED'; notes?: string };
export type Dashboard = { visitorsToday: number; inside: number; exitedToday: number; activeBlocks: number; recentVisitors: Visitor[]; activity: { date: string; visitors: number; exited: number }[] };
