// Comprehensive Parking System Operations
// This file contains all the core parking system logic

import ParkingDataManager, { Session, Slot, User, QueueEntry } from './ParkingData';

class ParkingSystem {
  private static instance: ParkingSystem;
  private dataManager: ParkingDataManager;

  private constructor() {
    this.dataManager = ParkingDataManager.getInstance();
  }

  static getInstance(): ParkingSystem {
    if (!ParkingSystem.instance) {
      ParkingSystem.instance = new ParkingSystem();
    }
    return ParkingSystem.instance;
  }

  // QR Code Generation for Hardware Devices
  generateEntryQR(gateId: string = 'GATE_01') {
    const qrData = {
      action: 'entry',
      gateId: gateId,
      timestamp: Date.now(),
      validUntil: Date.now() + (5 * 60 * 1000), // 5 minutes validity
      hash: this.generateSecureHash(gateId + Date.now()),
      deviceId: 'ENTRY_DEVICE_01'
    };

    return {
      qrCode: JSON.stringify(qrData), // In real app, this would be actual QR code
      data: qrData,
      displayText: `Entry QR - Gate ${gateId}`,
      validityTime: 5 // minutes
    };
  }

  generateExitQR(gateId: string = 'GATE_01') {
    const qrData = {
      action: 'exit',
      gateId: gateId,
      timestamp: Date.now(),
      validUntil: Date.now() + (5 * 60 * 1000),
      hash: this.generateSecureHash(gateId + Date.now()),
      deviceId: 'EXIT_DEVICE_01'
    };

    return {
      qrCode: JSON.stringify(qrData),
      data: qrData,
      displayText: `Exit QR - Gate ${gateId}`,
      validityTime: 5
    };
  }

  // QR Code Validation
  validateQRCode(qrData: any): { valid: boolean; message: string } {
    try {
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      
      if (!data.timestamp || !data.validUntil || !data.action) {
        return { valid: false, message: 'Invalid QR code format' };
      }

      if (Date.now() > data.validUntil) {
        return { valid: false, message: 'QR code has expired. Please scan a new one.' };
      }

      if (!['entry', 'exit'].includes(data.action)) {
        return { valid: false, message: 'Invalid QR code action' };
      }

      return { valid: true, message: 'QR code is valid' };
    } catch (error) {
      return { valid: false, message: 'Invalid QR code' };
    }
  }

  // Vehicle Entry Process
  processVehicleEntry(qrData: any, vehicleId: string) {
    const currentTime = new Date();
    
    // Validate QR code
    const qrValidation = this.validateQRCode(qrData);
    if (!qrValidation.valid) {
      return { success: false, message: qrValidation.message };
    }

    // Check for existing active session
    const existingSession = this.dataManager.getActiveSession(vehicleId);
    if (existingSession) {
      return { success: false, message: 'Vehicle already has active parking session' };
    }

    // Get user information
    const user = this.dataManager.getUserByVehicle(vehicleId);
    if (!user) {
      return { success: false, message: 'Vehicle not registered in system' };
    }

    if (!user.isActive) {
      return { success: false, message: 'User account is deactivated' };
    }

    // Check slot availability
    const availableSlots = this.dataManager.getAvailableSlots(user.vehicleType);
    
    if (availableSlots.length === 0) {
      return this.addToQueue(vehicleId, user, currentTime);
    }

    // Assign optimal slot
    const assignedSlot = this.assignOptimalSlot(user, availableSlots);
    const otp = this.generateOTP();

    // Create parking session
    const session: Session = {
      id: this.generateSessionId(),
      vehicleId: vehicleId,
      slotId: assignedSlot.id,
      otp: otp,
      entryRequestTime: currentTime,
      entryTime: null,
      exitTime: null,
      status: 'pending_entry',
      entryMethod: 'qr',
      entryVerified: false,
      gateId: typeof qrData === 'object' ? qrData.gateId : undefined,
      estimatedExitTime: new Date(currentTime.getTime() + (8 * 60 * 60 * 1000)), // 8 hours
      actualDuration: null,
      violations: [],
      photos: {
        entry: null,
        exit: null
      }
    };

    this.dataManager.addSession(session);

    // Reserve slot temporarily
    this.dataManager.updateSlot(assignedSlot.id, {
      status: 'Reserved',
      assignedTo: vehicleId,
      occupiedAt: currentTime
    });

    // Set timeout for slot release if not confirmed
    setTimeout(() => {
      const currentSession = this.dataManager.getSessions().find(s => s.id === session.id);
      if (currentSession && currentSession.status === 'pending_entry') {
        this.releaseSlot(assignedSlot.id);
        this.dataManager.updateSession(session.id, { status: 'timeout' });
      }
    }, 5 * 60 * 1000); // 5 minutes timeout

    return {
      success: true,
      slot: assignedSlot.id,
      slotLocation: assignedSlot.location,
      otp: otp,
      entryTime: currentTime,
      estimatedExit: session.estimatedExitTime,
      timeLimit: 5, // minutes to confirm parking
      message: `Assigned Slot: ${assignedSlot.id}. Park and confirm within 5 minutes.`
    };
  }

  // Confirm Parking
  confirmParking(vehicleId: string, slotId: string, otp: string) {
    const sessions = this.dataManager.getSessions();
    const session = sessions.find(s => 
      s.vehicleId === vehicleId && 
      s.status === 'pending_entry' &&
      s.otp === otp &&
      s.slotId === slotId
    );

    if (!session) {
      return { success: false, message: 'Invalid session or OTP' };
    }

    const currentTime = new Date();
    const timeFromRequest = currentTime.getTime() - new Date(session.entryRequestTime).getTime();

    if (timeFromRequest > 5 * 60 * 1000) { // 5 minutes timeout
      return { success: false, message: 'Entry timeout. Please request new slot.' };
    }

    // Confirm parking
    this.dataManager.updateSession(session.id, {
      entryTime: currentTime,
      status: 'entered',
      entryVerified: true
    });

    // Lock the slot
    this.dataManager.updateSlot(slotId, {
      status: 'Occupied',
      locked: true,
      occupiedAt: currentTime
    });

    // Update user statistics
    this.updateUserParkingStats(vehicleId, 'entry');

    return {
      success: true,
      entryTime: currentTime,
      slotId: slotId,
      estimatedExit: session.estimatedExitTime,
      message: 'Parking confirmed successfully!'
    };
  }

  // Vehicle Exit Process
  processVehicleExit(qrData: any, vehicleId: string, otp: string) {
    const currentTime = new Date();

    // Validate QR code
    const qrValidation = this.validateQRCode(qrData);
    if (!qrValidation.valid) {
      return { success: false, message: qrValidation.message };
    }

    // Find active session
    const sessions = this.dataManager.getSessions();
    const session = sessions.find(s => 
      s.vehicleId === vehicleId && 
      s.status === 'entered' &&
      s.otp === otp
    );

    if (!session) {
      return { success: false, message: 'No active parking session found or invalid OTP' };
    }

    // Calculate parking duration
    const entryTime = new Date(session.entryTime!);
    const parkingDuration = currentTime.getTime() - entryTime.getTime();
    const durationInMinutes = Math.floor(parkingDuration / (1000 * 60));
    const durationInHours = Math.floor(durationInMinutes / 60);
    const remainingMinutes = durationInMinutes % 60;

    // Check minimum parking time
    if (parkingDuration < 10 * 1000) { // 10 seconds minimum
      return { success: false, message: 'Minimum parking time not met' };
    }

    // Update session with exit details
    this.dataManager.updateSession(session.id, {
      exitTime: currentTime,
      status: 'pending_exit',
      actualDuration: parkingDuration
    });

    // Calculate charges if applicable
    const charges = this.calculateParkingCharges(durationInMinutes);

    // Process exit after 10 second delay (simulate gate opening)
    setTimeout(() => {
      this.completeExit(session, currentTime);
    }, 10000);

    return {
      success: true,
      exitTime: currentTime,
      entryTime: entryTime,
      duration: {
        total: durationInMinutes,
        hours: durationInHours,
        minutes: remainingMinutes,
        formatted: `${durationInHours}h ${remainingMinutes}m`
      },
      charges: charges,
      message: 'Exit processing... Gate will open in 10 seconds'
    };
  }

  // Complete Exit Process
  private completeExit(session: Session, exitTime: Date) {
    this.dataManager.updateSession(session.id, { status: 'exited' });

    // Free the slot
    this.dataManager.updateSlot(session.slotId, {
      status: 'Free',
      locked: false,
      assignedTo: null,
      occupiedAt: undefined,
      lastUsed: exitTime,
      usageCount: (this.dataManager.getSlots().find(s => s.id === session.slotId)?.usageCount || 0) + 1
    });

    // Update user statistics
    this.updateUserParkingStats(session.vehicleId, 'exit', session.actualDuration);

    // Process queue if available
    this.processQueue();

    return true;
  }

  // Smart Slot Assignment
  private assignOptimalSlot(user: User, availableSlots: Slot[]): Slot {
    // Priority: Accessibility > Preference > Proximity > Random
    if (user.priority === 'disabled') {
      const accessibleSlot = availableSlots.find(s => s.accessible);
      if (accessibleSlot) return accessibleSlot;
    }

    // Check user preferences
    const preferredSlot = availableSlots.find(s => 
      user.preferredSlots.includes(s.id)
    );
    if (preferredSlot) return preferredSlot;

    // Assign based on building proximity
    const nearbySlots = availableSlots.filter(s => 
      s.location.building === user.building
    );

    return nearbySlots[0] || availableSlots[0];
  }

  // Queue Management
  private addToQueue(vehicleId: string, user: User, queueTime: Date) {
    const queueEntry: QueueEntry = {
      id: this.generateSessionId(),
      vehicleId,
      userId: user.id,
      queueTime,
      priority: user.priority,
      estimatedWait: this.calculateWaitTime(),
      position: 0, // Will be set by addToQueue method
      notified: false,
      slotPreference: user.accessibilityNeeds ? 'accessible' : 'any'
    };

    this.dataManager.addToQueue(queueEntry);

    return {
      success: true,
      queued: true,
      position: queueEntry.position,
      estimatedWait: queueEntry.estimatedWait,
      message: `Added to queue. Position: ${queueEntry.position}, Wait: ${queueEntry.estimatedWait} mins`
    };
  }

  // Process Queue when slot becomes available
  processQueue() {
    const queue = this.dataManager.getQueue();
    if (queue.length === 0) return;

    const availableSlots = this.dataManager.getAvailableSlots();
    if (availableSlots.length === 0) return;

    const nextInQueue = queue[0];
    this.dataManager.removeFromQueue(nextInQueue.id);

    // Auto-process entry for queued vehicle
    // In real system, this would send notification to user
    console.log(`Slot available for vehicle ${nextInQueue.vehicleId}`);
  }

  // Utility Methods
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateSessionId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private generateSecureHash(data: string): string {
    // Simple hash for demo - in production use proper cryptographic hash
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  private calculateWaitTime(): number {
    // Simple calculation based on current queue length
    const queueLength = this.dataManager.getQueue().length;
    return Math.max(5, queueLength * 15); // 15 minutes per person minimum
  }

  private calculateParkingCharges(minutes: number): number {
    // Sample charging structure
    const hourlyRate = 20; // ₹20 per hour
    const hours = Math.ceil(minutes / 60);
    return hours * hourlyRate;
  }

  private releaseSlot(slotId: string) {
    this.dataManager.updateSlot(slotId, {
      status: 'Free',
      assignedTo: null,
      locked: false,
      occupiedAt: undefined
    });
  }

  private updateUserParkingStats(vehicleId: string, action: 'entry' | 'exit', duration?: number | null) {
    const user = this.dataManager.getUserByVehicle(vehicleId);
    if (!user) return;

    if (action === 'entry') {
      this.dataManager.updateUser(user.id, {
        lastParked: new Date()
      });
    } else if (action === 'exit' && duration) {
      const additionalTime = Math.floor(duration / (1000 * 60)); // convert to minutes
      this.dataManager.updateUser(user.id, {
        totalParkingTime: user.totalParkingTime + additionalTime
      });
    }
  }

  // Public utility methods for dashboard
  formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  }

  getCurrentSession(vehicleId: string): Session | null {
    return this.dataManager.getActiveSession(vehicleId);
  }

  getSlotById(slotId: string): Slot | null {
    return this.dataManager.getSlots().find(slot => slot.id === slotId) || null;
  }

  getUserByVehicle(vehicleId: string): User | null {
    return this.dataManager.getUserByVehicle(vehicleId);
  }
}

export default ParkingSystem;