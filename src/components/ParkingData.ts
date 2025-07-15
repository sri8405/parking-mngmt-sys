// Comprehensive Parking System Data Management
// This file simulates database operations using localStorage

export interface User {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  vehicleNo: string;
  vehicleType: '2W' | '4W';
  vehicleBrand: string;
  vehicleModel: string;
  vehicleColor: string;
  department: string;
  building: string;
  floor: number;
  designation: string;
  priority: 'normal' | 'vip' | 'disabled' | 'emergency';
  isActive: boolean;
  createdAt: Date;
  lastParked?: Date;
  totalParkingTime: number; // in minutes
  violations: number;
  preferredSlots: string[];
  notifications: boolean;
  accessibilityNeeds: boolean;
  password: string;
}

export interface Admin {
  id: number;
  name: string;
  adminId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  accessLevel: 'level1' | 'level2' | 'super_admin';
  permissions: {
    userManagement: boolean;
    slotManagement: boolean;
    systemSettings: boolean;
    reports: boolean;
    securityMonitoring: boolean;
    emergencyOverride: boolean;
  };
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: Date;
  password: string;
  createdAt: Date;
}

export interface Slot {
  id: string;
  type: '2W' | '4W';
  status: 'Free' | 'Occupied' | 'Reserved' | 'Maintenance';
  assignedTo: string | null;
  locked: boolean;
  location: {
    building: string;
    floor: number;
    zone: string;
    section: string;
  };
  covered: boolean;
  accessible: boolean;
  reserved: boolean;
  reservedBy: string | null;
  reservedUntil: Date | null;
  lastUsed: Date | null;
  usageCount: number;
  maintenanceStatus: 'good' | 'needs_attention' | 'under_maintenance';
  occupiedAt?: Date;
}

export interface Session {
  id: string;
  vehicleId: string;
  slotId: string;
  otp: string;
  entryRequestTime: Date;
  entryTime: Date | null;
  exitTime: Date | null;
  status: 'pending_entry' | 'entered' | 'pending_exit' | 'exited' | 'timeout';
  entryMethod: 'qr' | 'manual' | 'admin' | 'queue';
  entryVerified: boolean;
  gateId?: string;
  estimatedExitTime: Date;
  actualDuration: number | null;
  violations: string[];
  photos: {
    entry: string | null;
    exit: string | null;
  };
  location?: {
    lat: number;
    lng: number;
  };
}

export interface QueueEntry {
  id: string;
  vehicleId: string;
  userId: number;
  queueTime: Date;
  priority: 'normal' | 'vip' | 'disabled' | 'emergency';
  estimatedWait: number; // minutes
  position: number;
  notified: boolean;
  slotPreference?: 'covered' | 'ground_floor' | 'accessible' | 'any';
  responded?: boolean;
}

class ParkingDataManager {
  private static instance: ParkingDataManager;

  static getInstance(): ParkingDataManager {
    if (!ParkingDataManager.instance) {
      ParkingDataManager.instance = new ParkingDataManager();
    }
    return ParkingDataManager.instance;
  }

  // Initialize sample data
  initializeData() {
    if (!localStorage.getItem('parking_users')) {
      this.resetToSampleData();
    }
  }

  resetToSampleData() {
    // Sample Users
    const sampleUsers: User[] = [
      {
        id: 1,
        name: "John Doe",
        employeeId: "EMP001",
        email: "john.doe@company.com",
        phone: "+91-9876543210",
        vehicleNo: "KA01AB1234",
        vehicleType: "4W",
        vehicleBrand: "Toyota",
        vehicleModel: "Innova",
        vehicleColor: "White",
        department: "Engineering",
        building: "A",
        floor: 3,
        designation: "Senior Engineer",
        priority: "normal",
        isActive: true,
        createdAt: new Date(),
        totalParkingTime: 2400,
        violations: 0,
        preferredSlots: ["A1-01", "A1-05", "A1-10"],
        notifications: true,
        accessibilityNeeds: false,
        password: "password123"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        employeeId: "EMP002",
        email: "sarah.johnson@company.com",
        phone: "+91-9876543211",
        vehicleNo: "KA02CD5678",
        vehicleType: "2W",
        vehicleBrand: "Honda",
        vehicleModel: "Activa",
        vehicleColor: "Red",
        department: "HR",
        building: "B",
        floor: 2,
        designation: "HR Manager",
        priority: "vip",
        isActive: true,
        createdAt: new Date(),
        totalParkingTime: 1800,
        violations: 0,
        preferredSlots: ["B1-15", "B1-20"],
        notifications: true,
        accessibilityNeeds: false,
        password: "password123"
      }
    ];

    // Sample Admins
    const sampleAdmins: Admin[] = [
      {
        id: 1,
        name: "Admin User",
        adminId: "ADM001",
        email: "admin@company.com",
        phone: "+91-9876543220",
        department: "IT",
        designation: "System Administrator",
        accessLevel: "super_admin",
        permissions: {
          userManagement: true,
          slotManagement: true,
          systemSettings: true,
          reports: true,
          securityMonitoring: true,
          emergencyOverride: true
        },
        status: "approved",
        password: "admin123",
        createdAt: new Date()
      }
    ];

    // Sample Slots (150 slots total)
    const sampleSlots: Slot[] = [];
    const buildings = ['A', 'B', 'C'];
    const floors = [1, 2];
    let slotCounter = 1;

    buildings.forEach(building => {
      floors.forEach(floor => {
        // 4W slots (25 per floor per building)
        for (let i = 1; i <= 25; i++) {
          sampleSlots.push({
            id: `${building}${floor}-${i.toString().padStart(2, '0')}`,
            type: '4W',
            status: Math.random() > 0.6 ? 'Occupied' : 'Free',
            assignedTo: null,
            locked: false,
            location: {
              building,
              floor,
              zone: i <= 12 ? 'North' : 'South',
              section: i <= 6 ? 'A' : i <= 12 ? 'B' : i <= 18 ? 'C' : 'D'
            },
            covered: floor === 1,
            accessible: i <= 3,
            reserved: false,
            reservedBy: null,
            reservedUntil: null,
            lastUsed: new Date(Date.now() - Math.random() * 86400000),
            usageCount: Math.floor(Math.random() * 200),
            maintenanceStatus: 'good'
          });
        }
      });
    });

    // Add some 2W slots
    for (let i = 1; i <= 75; i++) {
      const building = buildings[Math.floor((i - 1) / 25)];
      const slotNum = ((i - 1) % 25) + 1;
      sampleSlots.push({
        id: `2W-${building}${slotNum.toString().padStart(2, '0')}`,
        type: '2W',
        status: Math.random() > 0.7 ? 'Occupied' : 'Free',
        assignedTo: null,
        locked: false,
        location: {
          building,
          floor: 1,
          zone: 'Bike Parking',
          section: slotNum <= 12 ? 'East' : 'West'
        },
        covered: true,
        accessible: false,
        reserved: false,
        reservedBy: null,
        reservedUntil: null,
        lastUsed: new Date(Date.now() - Math.random() * 86400000),
        usageCount: Math.floor(Math.random() * 150),
        maintenanceStatus: 'good'
      });
    }

    // Save to localStorage
    localStorage.setItem('parking_users', JSON.stringify(sampleUsers));
    localStorage.setItem('parking_admins', JSON.stringify(sampleAdmins));
    localStorage.setItem('parking_slots', JSON.stringify(sampleSlots));
    localStorage.setItem('parking_sessions', JSON.stringify([]));
    localStorage.setItem('parking_queue', JSON.stringify([]));
  }

  // User operations
  getUsers(): User[] {
    const users = localStorage.getItem('parking_users');
    return users ? JSON.parse(users) : [];
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  getUserByVehicle(vehicleNo: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.vehicleNo === vehicleNo) || null;
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('parking_users', JSON.stringify(users));
  }

  updateUser(userId: number, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('parking_users', JSON.stringify(users));
    }
  }

  // Admin operations
  getAdmins(): Admin[] {
    const admins = localStorage.getItem('parking_admins');
    return admins ? JSON.parse(admins) : [];
  }

  getAdminByEmail(email: string): Admin | null {
    const admins = this.getAdmins();
    return admins.find(admin => admin.email === email) || null;
  }

  addAdmin(admin: Admin): void {
    const admins = this.getAdmins();
    admins.push(admin);
    localStorage.setItem('parking_admins', JSON.stringify(admins));
  }

  // Slot operations
  getSlots(): Slot[] {
    const slots = localStorage.getItem('parking_slots');
    return slots ? JSON.parse(slots) : [];
  }

  getAvailableSlots(vehicleType?: '2W' | '4W'): Slot[] {
    const slots = this.getSlots();
    return slots.filter(slot => 
      slot.status === 'Free' && 
      !slot.locked && 
      !slot.reserved &&
      (vehicleType ? slot.type === vehicleType : true)
    );
  }

  updateSlot(slotId: string, updates: Partial<Slot>): void {
    const slots = this.getSlots();
    const index = slots.findIndex(slot => slot.id === slotId);
    if (index !== -1) {
      slots[index] = { ...slots[index], ...updates };
      localStorage.setItem('parking_slots', JSON.stringify(slots));
    }
  }

  // Session operations
  getSessions(): Session[] {
    const sessions = localStorage.getItem('parking_sessions');
    return sessions ? JSON.parse(sessions) : [];
  }

  getActiveSession(vehicleId: string): Session | null {
    const sessions = this.getSessions();
    return sessions.find(session => 
      session.vehicleId === vehicleId && 
      (session.status === 'entered' || session.status === 'pending_entry')
    ) || null;
  }

  addSession(session: Session): void {
    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem('parking_sessions', JSON.stringify(sessions));
  }

  updateSession(sessionId: string, updates: Partial<Session>): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(session => session.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      localStorage.setItem('parking_sessions', JSON.stringify(sessions));
    }
  }

  // Queue operations
  getQueue(): QueueEntry[] {
    const queue = localStorage.getItem('parking_queue');
    return queue ? JSON.parse(queue) : [];
  }

  addToQueue(queueEntry: QueueEntry): void {
    const queue = this.getQueue();
    // Insert based on priority
    const priorityOrder = { emergency: 0, disabled: 1, vip: 2, normal: 3 };
    const insertIndex = queue.findIndex(entry => 
      priorityOrder[entry.priority] > priorityOrder[queueEntry.priority]
    );
    
    if (insertIndex === -1) {
      queue.push(queueEntry);
    } else {
      queue.splice(insertIndex, 0, queueEntry);
    }
    
    // Update positions
    queue.forEach((entry, index) => {
      entry.position = index + 1;
    });
    
    localStorage.setItem('parking_queue', JSON.stringify(queue));
  }

  removeFromQueue(queueId: string): void {
    const queue = this.getQueue();
    const filteredQueue = queue.filter(entry => entry.id !== queueId);
    
    // Update positions
    filteredQueue.forEach((entry, index) => {
      entry.position = index + 1;
    });
    
    localStorage.setItem('parking_queue', JSON.stringify(filteredQueue));
  }

  // Statistics
  getStatistics() {
    const slots = this.getSlots();
    const sessions = this.getSessions();
    const queue = this.getQueue();
    
    const totalSlots = slots.length;
    const occupiedSlots = slots.filter(slot => slot.status === 'Occupied').length;
    const availableSlots = totalSlots - occupiedSlots;
    const queueLength = queue.length;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEntries = sessions.filter(session => 
      session.entryTime && new Date(session.entryTime) >= todayStart
    ).length;

    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      queueLength,
      activeUsers: sessions.filter(s => s.status === 'entered').length,
      todayEntries,
      occupancyRate: (occupiedSlots / totalSlots) * 100
    };
  }
}

export default ParkingDataManager;