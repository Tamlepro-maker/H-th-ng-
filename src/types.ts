export type UserRole = 'RESIDENT' | 'BQL' | 'KTV';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
  apartmentCode?: string;
  department?: string;
  avatar: string;
}

export type TicketStatus = 
  | 'CHO_DUYET'                 // Chờ BQL tiếp nhận / phân loại
  | 'DANG_XU_LY'                // Đã giao KTV, KTV đang khảo sát / sửa chữa
  | 'CHO_NGHIEM_THU'            // KTV đã nộp kết quả, chờ Cư dân / BQL nghiệm thu
  | 'CHO_XAC_MINH_KHIEU_NAI'     // Cư dân gửi khiếu nại chưa đạt đối với tài sản riêng -> Chờ BQL xác minh
  | 'DA_NGHIEM_THU'             // Đã nghiệm thu đạt -> đóng phiếu (chuyển vào Lịch sử)
  | 'YEU_CAU_LAM_LAI';          // Nghiệm thu chưa đạt, yêu cầu xử lý lại

export type Priority = 'P1' | 'P2' | 'P3'; // P1: Khẩn cấp (2h), P2: Cần sớm (6h), P3: Tiêu chuẩn (24h)

export type PropertyScope = 'SO_HUU_RIENG' | 'SO_HUU_CHUNG';

export type IncidentCategory = 
  | 'Dien' 
  | 'Nuoc' 
  | 'DieuHoa' 
  | 'ThangMay' 
  | 'PCCC' 
  | 'ThamDot' 
  | 'CoKhi' 
  | 'Khac';

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export interface TicketTimelineEvent {
  step: number;
  title: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  note?: string;
}

export interface TicketMedia {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  timestamp?: string;
  watermark?: string; // GPS & Timestamp text
}

export interface TicketComplaint {
  reason: string;
  photos: TicketMedia[];
  submittedAt: string;
  status: 'CHO_XAC_MINH' | 'HOP_LE' | 'KHONG_HOP_LE';
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNote?: string;
  reassignedTechnicianId?: string;
  reassignedTechnicianName?: string;
}

export interface MaintenanceTicket {
  id: string; // e.g. #PA-01
  code: string; // e.g. PA-01
  title: string;
  residentId: string;
  residentName: string;
  apartmentCode: string;
  residentPhone: string;
  
  scope: PropertyScope;
  category: IncidentCategory;
  location: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  
  createdAt: string; // ISO
  slaDeadline: string; // ISO
  
  // Classification
  responsibilityScope?: 'CAN_HO' | 'BAN_QUAN_LY' | 'CHU_DAU_TU';
  technicalDept?: string;
  
  // Evidence photos/videos from Resident
  initialMedia: TicketMedia[];
  
  // Assignment
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedTechnicianPhone?: string;
  assignedAt?: string;
  
  // Technician execution
  technicianAcceptedAt?: string;
  beforePhotos: TicketMedia[];
  materialsUsed: MaterialItem[];
  technicianNotes?: string;
  afterPhotos: TicketMedia[];
  submittedAt?: string;
  
  // 48-Hour Acceptance window for SO_HUU_RIENG
  autoCloseAt?: string;
  closedReason?: string;
  
  // Acceptance
  acceptedAt?: string;
  rating?: number; // 1 to 5 stars (Resident only, optional)
  ratingFeedback?: string;
  rejectionReason?: string;
  rejectionPhotos?: TicketMedia[];
  
  // Complaint & Verification
  complaint?: TicketComplaint;
  
  // Timeline audit trail
  timeline: TicketTimelineEvent[];
  
  // Followers for common property
  followers?: string[];
}

export interface PeriodicMaintenancePlan {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  location: string;
  cycle: 'Hàng tuần' | 'Hàng tháng' | 'Hàng quý' | 'Hàng năm';
  lastMaintained: string;
  nextDue: string;
  assignedKtvId: string;
  assignedKtvName: string;
  status: 'DEN_HAN' | 'DANG_THUC_HIEN' | 'DA_HOAN_THANH';
  checkList: { title: string; standard: string; actual?: string; passed?: boolean }[];
  safeCurrentRange: [number, number]; // [min, max] Ampe
  safePressureRange: [number, number]; // [min, max] Bar
  safeTempRange: [number, number]; // [min, max] Độ C
}

export type EquipmentCategory = 'CoDien' | 'Nuoc' | 'ThangMay' | 'PCCC' | 'HVAC' | 'MayPhatDien';
export type EquipmentStatus = 'HOAT_DONG_TOT' | 'DEN_HAN_BAO_TRI' | 'DANG_BAO_TRI' | 'CAN_SUA_CHUA';

export interface EquipmentItem {
  id: string;
  code: string; // e.g. TM-01-AQUA
  name: string;
  category: EquipmentCategory;
  location: string;
  manufacturer?: string;
  model?: string;
  installDate?: string;
  status: EquipmentStatus;
  cycle: 'Hàng tuần' | 'Hàng tháng' | 'Hàng quý' | 'Hàng năm';
  safeCurrentRange?: [number, number];
  safePressureRange?: [number, number];
  safeTempRange?: [number, number];
  notes?: string;
}

export interface MaintenanceHistoryRecord {
  id: string; // e.g. MLOG-001
  planId?: string;
  equipmentCode: string;
  equipmentName: string;
  location: string;
  maintenanceDate: string; // YYYY-MM-DD
  technicianId: string;
  technicianName: string;
  result: 'DAT_TIEU_CHUAN' | 'CAN_THEO_DOI' | 'KHONG_DAT';
  checklistResults: {
    title: string;
    standard: string;
    passed: boolean;
    actualValue?: string;
  }[];
  measuredCurrent?: number; // Ampe
  measuredPressure?: number; // Bar
  measuredTemp?: number; // °C
  photoUrl?: string;
  watermark?: string;
  notes?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  category: EquipmentCategory;
  items: { title: string; standard: string }[];
  defaultCurrentRange: [number, number];
  defaultPressureRange: [number, number];
  defaultTempRange: [number, number];
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'ALL';
  title: string;
  message: string;
  ticketId?: string;
  timestamp: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}

