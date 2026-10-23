import { useState, useEffect, useCallback } from 'react';
import { 
  MaintenanceTicket, 
  AppNotification, 
  PeriodicMaintenancePlan, 
  UserProfile, 
  UserRole,
  Priority,
  PropertyScope,
  IncidentCategory,
  TicketMedia,
  MaterialItem,
  TicketStatus,
  EquipmentItem,
  MaintenanceHistoryRecord
} from './types';
import { 
  SYSTEM_USERS, 
  AVAILABLE_TECHNICIANS, 
  SAMPLE_PERIODIC_PLANS,
  SAMPLE_EQUIPMENTS,
  SAMPLE_MAINTENANCE_HISTORY
} from './mockData';

const STORAGE_KEYS = {
  TICKETS: 'apt_maintenance_tickets_v2',
  NOTIFICATIONS: 'apt_maintenance_notifications_v2',
  PERIODIC: 'apt_maintenance_periodic_v2',
  CURRENT_USER: 'apt_maintenance_curr_user_v2',
  EQUIPMENTS: 'apt_maintenance_equipments_v2',
  HISTORY: 'apt_maintenance_history_v2',
};

// Cross-tab and role broadcast channel
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('apt_maintenance_realtime_channel')
  : null;

export function useAppStore() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return SYSTEM_USERS.CD01.user;
  });

  // Note: user explicitly requested initial state to be clean/empty:
  // "giờ để cả 3 giao diện đều trắng đi, để tôi tạo phiếu từ đầu và bắt đầu một vòng hoàn toàn mới"
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [periodicPlans, setPeriodicPlans] = useState<PeriodicMaintenancePlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERIODIC);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return SAMPLE_PERIODIC_PLANS;
  });

  const [equipments, setEquipments] = useState<EquipmentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return SAMPLE_EQUIPMENTS;
  });

  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return SAMPLE_MAINTENANCE_HISTORY;
  });

  // Active toast banner for live role action notifications
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Sync state across browser tabs & roles
  useEffect(() => {
    const handleSync = (e: MessageEvent) => {
      if (e.data?.type === 'SYNC_ALL') {
        try {
          const t = localStorage.getItem(STORAGE_KEYS.TICKETS);
          const n = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
          const p = localStorage.getItem(STORAGE_KEYS.PERIODIC);
          const eq = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
          const h = localStorage.getItem(STORAGE_KEYS.HISTORY);
          if (t) setTickets(JSON.parse(t));
          if (n) setNotifications(JSON.parse(n));
          if (p) setPeriodicPlans(JSON.parse(p));
          if (eq) setEquipments(JSON.parse(eq));
          if (h) setMaintenanceHistory(JSON.parse(h));
        } catch (err) {
          console.error(err);
        }
      } else if (e.data?.type === 'NOTIFY_EVENT') {
        const notif: AppNotification = e.data.payload;
        setActiveToast(notif);
      }
    };

    if (syncChannel) {
      syncChannel.addEventListener('message', handleSync);
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TICKETS && e.newValue) {
        setTickets(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.NOTIFICATIONS && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.PERIODIC && e.newValue) {
        setPeriodicPlans(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.EQUIPMENTS && e.newValue) {
        setEquipments(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.HISTORY && e.newValue) {
        setMaintenanceHistory(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (syncChannel) syncChannel.removeEventListener('message', handleSync);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Save changes and broadcast
  const persistAndBroadcast = useCallback((newTickets: MaintenanceTicket[], newNotifs?: AppNotification[], newPlans?: PeriodicMaintenancePlan[], newEquipments?: EquipmentItem[], newHistory?: MaintenanceHistoryRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(newTickets));
    setTickets(newTickets);

    if (newNotifs) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifs));
      setNotifications(newNotifs);
    }
    if (newPlans) {
      localStorage.setItem(STORAGE_KEYS.PERIODIC, JSON.stringify(newPlans));
      setPeriodicPlans(newPlans);
    }
    if (newEquipments) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(newEquipments));
      setEquipments(newEquipments);
    }
    if (newHistory) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
      setMaintenanceHistory(newHistory);
    }

    syncChannel?.postMessage({ type: 'SYNC_ALL' });
  }, []);

  const pushNotification = useCallback((targetRole: UserRole | 'ALL', title: string, message: string, ticketId?: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO') => {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 6),
      targetRole,
      title,
      message,
      ticketId,
      timestamp: new Date().toISOString(),
      read: false,
      type,
    };

    const updated = [newNotif, ...notifications];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    setNotifications(updated);
    setActiveToast(newNotif);

    syncChannel?.postMessage({ type: 'NOTIFY_EVENT', payload: newNotif });
  }, [notifications]);

  // Login handler
  const login = useCallback((username: string, pass: string): { success: boolean; error?: string } => {
    const record = SYSTEM_USERS[username.toUpperCase().trim()];
    if (!record) {
      return { success: false, error: 'Tài khoản không tồn tại (CD01, CD02, BQL01-03, KTV01-03)' };
    }
    if (record.passwordHash !== pass) {
      return { success: false, error: 'Mật khẩu không chính xác (Mặc định: 123456)' };
    }
    setCurrentUser(record.user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(record.user));
    return { success: true };
  }, []);

  // Switch between accounts of the same role (e.g., BQL01 ↔ BQL02, KTV01 ↔ KTV02)
  const switchAccount = useCallback((username: string) => {
    const record = SYSTEM_USERS[username.toUpperCase().trim()];
    if (record) {
      setCurrentUser(record.user);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(record.user));
    }
  }, []);

  // Fast switch role helper
  const switchRole = useCallback((role: UserRole) => {
    let targetUser = SYSTEM_USERS.CD01.user;
    if (role === 'BQL') targetUser = SYSTEM_USERS.BQL01.user;
    if (role === 'KTV') targetUser = SYSTEM_USERS.KTV01.user;

    setCurrentUser(targetUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(targetUser));
  }, []);

  const logout = useCallback(() => {
    // switch to CD01 by default
    switchRole('RESIDENT');
  }, [switchRole]);

  // SLA Calculation helper
  const calculateSlaDeadline = (priority: Priority, fromDate: Date = new Date()): string => {
    const hours = priority === 'P1' ? 2 : priority === 'P2' ? 6 : 24;
    const deadline = new Date(fromDate.getTime() + hours * 3600 * 1000);
    return deadline.toISOString();
  };

  // Check for common property duplicates (within 60 mins at same location)
  const checkForDuplicates = useCallback((scope: PropertyScope, location: string, category: IncidentCategory) => {
    if (scope !== 'SO_HUU_CHUNG') return null;
    const now = Date.now();
    const existing = tickets.find(t => {
      if (t.scope !== 'SO_HUU_CHUNG') return false;
      if (t.status === 'DA_NGHIEM_THU') return false;
      const createdTime = new Date(t.createdAt).getTime();
      const diffMinutes = (now - createdTime) / (1000 * 60);
      const locMatch = t.location.toLowerCase().includes(location.trim().toLowerCase()) ||
                       location.trim().toLowerCase().includes(t.location.toLowerCase());
      return diffMinutes <= 60 && locMatch && t.category === category;
    });
    return existing || null;
  }, [tickets]);

  // Create Ticket (Resident)
  const createTicket = useCallback((params: {
    title: string;
    scope: PropertyScope;
    category: IncidentCategory;
    location: string;
    description: string;
    priority: Priority;
    media: TicketMedia[];
  }): MaintenanceTicket => {
    const count = tickets.length + 1;
    const paddedCode = count < 10 ? `0${count}` : `${count}`;
    const code = `PA-${paddedCode}`;
    const id = `#${code}`;
    const now = new Date();

    const newTicket: MaintenanceTicket = {
      id,
      code,
      title: params.title || `${params.category} tại ${params.location}`,
      residentId: currentUser.id,
      residentName: currentUser.name,
      apartmentCode: currentUser.apartmentCode || 'P.1204 - Aqua 1',
      residentPhone: currentUser.phone,
      scope: params.scope,
      category: params.category,
      location: params.location,
      description: params.description,
      priority: params.priority,
      status: 'CHO_DUYET',
      createdAt: now.toISOString(),
      slaDeadline: calculateSlaDeadline(params.priority, now),
      initialMedia: params.media,
      beforePhotos: [],
      materialsUsed: [],
      afterPhotos: [],
      timeline: [
        {
          step: 1,
          title: 'Khởi tạo phản ánh sự cố',
          timestamp: now.toISOString(),
          actor: currentUser.name,
          actorRole: 'RESIDENT',
          note: `Đã gửi báo cáo với ${params.media.length} tệp đính kèm. Bắt đầu đếm SLA ${params.priority}.`,
        },
      ],
      followers: [currentUser.name],
    };

    const updatedTickets = [newTicket, ...tickets];
    persistAndBroadcast(updatedTickets);

    pushNotification(
      'BQL',
      `Phiếu sự cố mới: ${id}`,
      `Cư dân ${currentUser.name} (${currentUser.apartmentCode}) vừa báo sự cố [${params.category}] tại ${params.location}.`,
      id,
      params.priority === 'P1' ? 'ALERT' : 'INFO'
    );

    return newTicket;
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // Follow an existing duplicate common property ticket
  const followExistingTicket = useCallback((ticketId: string) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        const followers = t.followers || [];
        if (!followers.includes(currentUser.name)) {
          return {
            ...t,
            followers: [...followers, currentUser.name],
          };
        }
      }
      return t;
    });
    persistAndBroadcast(updated);
    pushNotification(
      'RESIDENT',
      `Đã theo dõi sự cố ${ticketId}`,
      `Bạn sẽ nhận được thông báo cập nhật tiến độ cho sự cố sở hữu chung này.`,
      ticketId,
      'SUCCESS'
    );
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // BQL classifies priority, responsibility and technical department (FR02.03)
  const classifyTicket = useCallback((
    ticketId: string,
    priority: Priority,
    responsibilityScope?: 'CAN_HO' | 'BAN_QUAN_LY' | 'CHU_DAU_TU',
    technicalDept?: string,
    note?: string
  ) => {
    const now = new Date();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          priority,
          responsibilityScope: responsibilityScope || t.responsibilityScope,
          technicalDept: technicalDept || t.technicalDept,
          slaDeadline: calculateSlaDeadline(priority, new Date(t.createdAt)),
          timeline: [
            ...t.timeline,
            {
              step: 2,
              title: `BQL phân loại sự cố: Mức ${priority}`,
              timestamp: now.toISOString(),
              actor: currentUser.name,
              actorRole: 'BQL' as UserRole,
              note: `Phân loại ưu tiên: ${priority}. Trách nhiệm: ${responsibilityScope === 'CAN_HO' ? 'Căn hộ chi trả' : responsibilityScope === 'BAN_QUAN_LY' ? 'Ban quản lý' : 'Chủ đầu tư'}. Bộ phận: ${technicalDept || 'Kỹ thuật MEP'}. ${note || ''}`,
            },
          ],
        };
      }
      return t;
    });

    persistAndBroadcast(updated);
    pushNotification(
      'BQL',
      `Đã phân loại ${ticketId}`,
      `Đã gán mức ưu tiên ${priority} và bộ phận kỹ thuật ${technicalDept || 'MEP'}.`,
      ticketId,
      priority === 'P1' ? 'ALERT' : 'INFO'
    );
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // BQL approves & assigns KTV (Step 2)
  const assignTechnician = useCallback((
    ticketId: string, 
    priority: Priority, 
    technicianId: string, 
    note?: string,
    responsibilityScope?: 'CAN_HO' | 'BAN_QUAN_LY' | 'CHU_DAU_TU',
    technicalDept?: string
  ) => {
    const tech = AVAILABLE_TECHNICIANS.find(t => t.id === technicianId) || AVAILABLE_TECHNICIANS[0];
    const now = new Date();

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          priority,
          responsibilityScope: responsibilityScope || t.responsibilityScope,
          technicalDept: technicalDept || t.technicalDept,
          slaDeadline: calculateSlaDeadline(priority, new Date(t.createdAt)),
          assignedTechnicianId: tech.id,
          assignedTechnicianName: tech.name,
          assignedTechnicianPhone: tech.phone,
          assignedAt: now.toISOString(),
          status: 'DANG_XU_LY' as TicketStatus,
          timeline: [
            ...t.timeline,
            {
              step: 2,
              title: 'BQL phê duyệt & Phân công kỹ thuật',
              timestamp: now.toISOString(),
              actor: currentUser.name,
              actorRole: 'BQL' as UserRole,
              note: `Giao cho KTV ${tech.name} (${tech.phone}). Mức ưu tiên: ${priority}. Trách nhiệm: ${responsibilityScope || 'Theo quy chế'}. ${note || ''}`,
            },
          ],
        };
      }
      return t;
    });

    persistAndBroadcast(updated);

    // Notify KTV
    pushNotification(
      'KTV',
      `Phân công mới: ${ticketId}`,
      `Bạn được phân công xử lý sự cố ${ticketId} (${priority}) tại phòng/khu vực: ${tickets.find(t => t.id === ticketId)?.location}`,
      ticketId,
      'WARNING'
    );

    // Notify Resident
    pushNotification(
      'RESIDENT',
      `Phiếu ${ticketId} đã được duyệt`,
      `BQL đã phân công KTV ${tech.name} (${tech.phone}) tiếp nhận xử lý sự cố của bạn.`,
      ticketId,
      'INFO'
    );
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // KTV accepts ticket and takes Before photo (Step 3a)
  const ktvAcceptTicket = useCallback((ticketId: string, beforePhotos: TicketMedia[], note?: string) => {
    const now = new Date();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          technicianAcceptedAt: now.toISOString(),
          beforePhotos,
          timeline: [
            ...t.timeline,
            {
              step: 3,
              title: 'KTV tiếp nhận & Khảo sát hiện trường',
              timestamp: now.toISOString(),
              actor: currentUser.name,
              actorRole: 'KTV' as UserRole,
              note: `Đã đến hiện trường, tải lên ${beforePhotos.length} ảnh Before có đóng dấu GPS/thời gian. ${note || ''}`,
            },
          ],
        };
      }
      return t;
    });

    persistAndBroadcast(updated);

    pushNotification(
      'RESIDENT',
      `KTV đang có mặt tại hiện trường (${ticketId})`,
      `KTV ${currentUser.name} đã đến khảo sát và bắt đầu xử lý sự cố.`,
      ticketId,
      'INFO'
    );
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // KTV submits repair completion with After photos + materials (Step 4)
  const ktvSubmitCompletion = useCallback((
    ticketId: string, 
    afterPhotos: TicketMedia[], 
    materialsUsed: MaterialItem[], 
    technicianNotes: string
  ) => {
    const now = new Date();
    const currentTicket = tickets.find(t => t.id === ticketId);
    const isCommon = currentTicket?.scope === 'SO_HUU_CHUNG';
    const targetAcceptorRole: UserRole = isCommon ? 'BQL' : 'RESIDENT';

    // 48-Hour auto-close deadline for private property (SO_HUU_RIENG)
    const autoCloseAt = isCommon 
      ? undefined 
      : new Date(now.getTime() + 48 * 3600 * 1000).toISOString();

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'CHO_NGHIEM_THU' as TicketStatus,
          afterPhotos,
          materialsUsed,
          technicianNotes,
          submittedAt: now.toISOString(),
          autoCloseAt,
          timeline: [
            ...t.timeline,
            {
              step: 4,
              title: 'KTV hoàn tất sửa chữa & Gửi nghiệm thu',
              timestamp: now.toISOString(),
              actor: currentUser.name,
              actorRole: 'KTV' as UserRole,
              note: `Đã khắc phục xong, đính kèm ảnh đối chứng Sau xử lý và ${materialsUsed.length} vật tư. Ghi chú: ${technicianNotes}. ${!isCommon ? 'Bắt đầu đếm ngược thời hạn phản hồi 48 giờ.' : ''}`,
            },
          ],
        };
      }
      return t;
    });

    persistAndBroadcast(updated);

    pushNotification(
      targetAcceptorRole,
      `Yêu cầu nghiệm thu sự cố ${ticketId}`,
      isCommon
        ? `KTV ${currentUser.name} đã hoàn tất bảo trì tài sản chung ${ticketId}. Vui lòng Ban Quản Lý nghiệm thu.`
        : `KTV ${currentUser.name} đã hoàn tất công việc tại căn hộ. Bạn có 48 giờ để xác nhận nghiệm thu hoặc gửi khiếu nại.`,
      ticketId,
      'SUCCESS'
    );
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // Acceptance passed (Nghiệm thu đạt -> closes ticket and moves to Lịch sử!)
  // Với tài sản riêng: Cư dân nghiệm thu, có thể đánh giá dịch vụ hoặc bỏ qua
  // Với tài sản chung: Ban quản lý nghiệm thu, không cần đánh giá
  const approveInspection = useCallback((ticketId: string, rating?: number, feedback: string = '') => {
    const now = new Date();
    const currentTicket = tickets.find(t => t.id === ticketId);
    const isCommon = currentTicket?.scope === 'SO_HUU_CHUNG';

    const closedReason = isCommon 
      ? 'Ban Quản Lý nghiệm thu đạt' 
      : (rating ? `Cư dân nghiệm thu đạt (${rating} sao)` : 'Cư dân xác nhận nghiệm thu đạt (Bỏ qua đánh giá)');

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'DA_NGHIEM_THU' as TicketStatus,
          acceptedAt: now.toISOString(),
          closedReason,
          rating: isCommon ? undefined : rating,
          ratingFeedback: isCommon ? undefined : feedback,
          timeline: [
            ...t.timeline,
            {
              step: 5,
              title: isCommon ? 'Ban Quản Lý nghiệm thu đạt & Đóng phiếu' : 'Cư dân xác nhận nghiệm thu đạt & Đóng phiếu',
              timestamp: now.toISOString(),
              actor: currentUser.name,
              actorRole: currentUser.role,
              note: isCommon
                ? 'Ban Quản Lý đã nghiệm thu đạt tiêu chuẩn kỹ thuật tòa nhà. Phiếu đã được đóng.'
                : rating
                ? `Cư dân đã nghiệm thu đạt. Đánh giá dịch vụ: ${rating} sao. ${feedback ? `Ý kiến: "${feedback}"` : ''}`
                : 'Cư dân đã xác nhận nghiệm thu đạt (bỏ qua phần đánh giá sao). Phiếu đã được đóng.',
            },
          ],
        };
      }
      return t;
    });

    persistAndBroadcast(updated);

    // Notify KTV and other actors
    pushNotification(
      'KTV',
      `Phiếu ${ticketId} đã được nghiệm thu ĐẠT!`,
      isCommon
        ? `Ban Quản Lý đã nghiệm thu đạt công việc sửa chữa của bạn. Phiếu đã hoàn tất.`
        : rating
        ? `Cư dân đã đánh giá ${rating} sao cho công việc sửa chữa của bạn. Phiếu đã chuyển vào lịch sử.`
        : `Cư dân đã xác nhận nghiệm thu đạt công việc của bạn. Phiếu đã chuyển vào lịch sử.`,
      ticketId,
      'SUCCESS'
    );

    if (currentUser.role !== 'BQL') {
      pushNotification(
        'BQL',
        `Hoàn tất phiếu ${ticketId}`,
        `Cư dân ${currentUser.name} (${currentTicket?.apartmentCode}) đã xác nhận nghiệm thu đạt và đóng phiếu.`,
        ticketId,
        'INFO'
      );
    }
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // Luồng kết quả nghiệm thu chưa đạt (A1):
  // - Tài sản riêng: Cư dân gửi khiếu nại và lý do chưa đạt -> chuyển trạng thái chờ BQL xác minh khiếu nại (A1.1, A1.2, A1.3)
  // - Tài sản chung: Ban quản lý ghi nhận lý do chưa đạt -> hệ thống chuyển phiếu về NV2 (KTV) để sửa chữa lại ngay lập tức (A1.4)
  const rejectInspection = useCallback((ticketId: string, reason: string, faultPhotos: TicketMedia[] = []) => {
    const now = new Date();
    const currentTicket = tickets.find(t => t.id === ticketId);
    const isCommon = currentTicket?.scope === 'SO_HUU_CHUNG';

    if (!isCommon) {
      // Tài sản riêng: Cư dân gửi khiếu nại
      const updated = tickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'CHO_XAC_MINH_KHIEU_NAI' as TicketStatus,
            complaint: {
              reason,
              photos: faultPhotos,
              submittedAt: now.toISOString(),
              status: 'CHO_XAC_MINH' as const,
            },
            rejectionReason: reason,
            rejectionPhotos: faultPhotos,
            timeline: [
              ...t.timeline,
              {
                step: 4,
                title: 'Cư dân gửi khiếu nại kết quả sửa chữa chưa đạt',
                timestamp: now.toISOString(),
                actor: currentUser.name,
                actorRole: 'RESIDENT' as UserRole,
                note: `Lý do: "${reason}". Đính kèm ${faultPhotos.length} ảnh minh chứng. Chờ Ban Quản Lý xác minh khiếu nại.`,
              },
            ],
          };
        }
        return t;
      });

      persistAndBroadcast(updated);

      // Thông báo cho Ban Quản Lý xác minh
      pushNotification(
        'BQL',
        `Cần xác minh khiếu nại: ${ticketId}`,
        `Cư dân ${currentUser.name} (${currentTicket?.apartmentCode}) khiếu nại kết quả sửa chữa: "${reason}". Vui lòng xác minh và điều phối lại KTV.`,
        ticketId,
        'ALERT'
      );
    } else {
      // Tài sản chung: Ban quản lý ghi nhận lý do chưa đạt -> chuyển thẳng về NV2 (KTV) làm lại
      const updated = tickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'YEU_CAU_LAM_LAI' as TicketStatus,
            rejectionReason: reason,
            rejectionPhotos: faultPhotos,
            timeline: [
              ...t.timeline,
              {
                step: 3,
                title: 'BQL ghi nhận chưa đạt & Chuyển KTV sửa chữa lại',
                timestamp: now.toISOString(),
                actor: currentUser.name,
                actorRole: 'BQL' as UserRole,
                note: `Ban Quản Lý ghi nhận lý do: "${reason}". Hệ thống đã chuyển phiếu về KTV ${currentTicket?.assignedTechnicianName} để khắc phục lại.`,
              },
            ],
          };
        }
        return t;
      });

      persistAndBroadcast(updated);

      pushNotification(
        'KTV',
        `Yêu cầu làm lại tài sản chung: ${ticketId}`,
        `BQL kiểm tra tài sản chung chưa đạt yêu cầu: "${reason}". Vui lòng kiểm tra và sửa chữa lại.`,
        ticketId,
        'ALERT'
      );
    }
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // Ban Quản Lý xác minh khiếu nại cư dân (A1.3):
  // - Nếu hợp lệ: chuyển phiếu về NV2 (KTV) sửa chữa lại, có thể điều phối lại KTV khác hoặc giữ nguyên
  // - Nếu không hợp lệ: lưu kết quả xác minh và thông báo cư dân
  const verifyComplaint = useCallback((
    ticketId: string,
    isValid: boolean,
    decisionNote: string,
    reassignedKtvId?: string
  ) => {
    const now = new Date();
    const currentTicket = tickets.find(t => t.id === ticketId);
    if (!currentTicket) return;

    let targetKtv = AVAILABLE_TECHNICIANS.find(t => t.id === (reassignedKtvId || currentTicket.assignedTechnicianId)) || AVAILABLE_TECHNICIANS[0];

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        if (isValid) {
          // Khiếu nại hợp lệ: điều phối lại KTV, chuyển trạng thái về sửa chữa lại
          return {
            ...t,
            status: 'YEU_CAU_LAM_LAI' as TicketStatus,
            assignedTechnicianId: targetKtv.id,
            assignedTechnicianName: targetKtv.name,
            assignedTechnicianPhone: targetKtv.phone,
            complaint: {
              ...(t.complaint || { reason: t.rejectionReason || '', photos: [], submittedAt: now.toISOString(), status: 'CHO_XAC_MINH' }),
              status: 'HOP_LE' as const,
              verifiedAt: now.toISOString(),
              verifiedBy: currentUser.name,
              verificationNote: decisionNote,
              reassignedTechnicianId: targetKtv.id,
              reassignedTechnicianName: targetKtv.name,
            },
            timeline: [
              ...t.timeline,
              {
                step: 3,
                title: 'BQL xác minh khiếu nại: HỢP LỆ & Điều phối lại',
                timestamp: now.toISOString(),
                actor: currentUser.name,
                actorRole: 'BQL' as UserRole,
                note: `Khiếu nại hợp lệ. Chỉ đạo: "${decisionNote}". Điều phối KTV phụ trách: ${targetKtv.name} (${targetKtv.phone}).`,
              },
            ],
          };
        } else {
          // Khiếu nại không hợp lệ: lưu kết quả xác minh và thông báo cư dân
          return {
            ...t,
            status: 'CHO_NGHIEM_THU' as TicketStatus,
            complaint: {
              ...(t.complaint || { reason: t.rejectionReason || '', photos: [], submittedAt: now.toISOString(), status: 'CHO_XAC_MINH' }),
              status: 'KHONG_HOP_LE' as const,
              verifiedAt: now.toISOString(),
              verifiedBy: currentUser.name,
              verificationNote: decisionNote,
            },
            timeline: [
              ...t.timeline,
              {
                step: 4,
                title: 'BQL xác minh khiếu nại: KHÔNG HỢP LỆ',
                timestamp: now.toISOString(),
                actor: currentUser.name,
                actorRole: 'BQL' as UserRole,
                note: `BQL xác minh khiếu nại không hợp lệ: "${decisionNote}". Đã lưu kết quả xác minh và thông báo cư dân.`,
              },
            ],
          };
        }
      }
      return t;
    });

    persistAndBroadcast(updated);

    if (isValid) {
      // Thông báo cho KTV được điều phối
      pushNotification(
        'KTV',
        `Điều phối xử lý lại: ${ticketId}`,
        `BQL đã xác minh khiếu nại hợp lệ và phân công bạn khắc phục sự cố ${ticketId}. Chỉ đạo: "${decisionNote}".`,
        ticketId,
        'ALERT'
      );

      // Thông báo cho Cư dân
      pushNotification(
        'RESIDENT',
        `BQL đã tiếp nhận khiếu nại ${ticketId}`,
        `Khiếu nại của bạn được duyệt hợp lệ. BQL đã điều phối KTV ${targetKtv.name} (${targetKtv.phone}) đến xử lý lại.`,
        ticketId,
        'SUCCESS'
      );
    } else {
      // Thông báo cho Cư dân khiếu nại không hợp lệ
      pushNotification(
        'RESIDENT',
        `Kết quả xác minh khiếu nại ${ticketId}`,
        `Ban Quản Lý đã kiểm tra và phản hồi khiếu nại: "${decisionNote}". Vui lòng kiểm tra lại kết quả nghiệm thu.`,
        ticketId,
        'WARNING'
      );
    }
  }, [tickets, currentUser, persistAndBroadcast, pushNotification]);

  // Luồng A2 – Tự động đóng phiếu sau 48 giờ không phản hồi:
  // Nếu cư dân không xác nhận nghiệm thu và không gửi khiếu nại trong thời hạn 48h, hệ thống tự động đóng phiếu
  const autoCloseTicketAfter48h = useCallback((ticketId: string) => {
    const now = new Date();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'DA_NGHIEM_THU' as TicketStatus,
          acceptedAt: now.toISOString(),
          closedReason: 'Tự động đóng phiếu do hết thời hạn phản hồi 48 giờ',
          timeline: [
            ...t.timeline,
            {
              step: 5,
              title: 'Tự động đóng phiếu do hết thời hạn phản hồi 48 giờ',
              timestamp: now.toISOString(),
              actor: 'Hệ thống tự động',
              actorRole: 'BQL' as UserRole,
              note: 'Quá thời hạn 48 giờ kể từ khi KTV nộp kết quả sửa chữa, cư dân không phản hồi xác nhận nghiệm thu hoặc khiếu nại. Hệ thống tự động đóng phiếu theo quy chuẩn.',
            },
          ],
        };
      }
      return t;
    });

    persistAndBroadcast(updated);

    pushNotification(
      'RESIDENT',
      `Phiếu ${ticketId} đã tự động đóng`,
      `Hệ thống đã tự động đóng phiếu sự cố do hết thời hạn 48 giờ phản hồi. Phiếu đã được chuyển vào mục Lịch sử.`,
      ticketId,
      'INFO'
    );

    pushNotification(
      'BQL',
      `Tự động đóng phiếu ${ticketId}`,
      `Phiếu tài sản riêng ${ticketId} đã được tự động đóng do hết thời hạn phản hồi 48 giờ của cư dân.`,
      ticketId,
      'INFO'
    );
  }, [tickets, persistAndBroadcast, pushNotification]);

  // Periodic Maintenance update
  const completePeriodicMaintenance = useCallback((planId: string, actualValues: { current: number; pressure: number; temp: number }, photo: TicketMedia) => {
    const now = new Date();
    const targetPlan = periodicPlans.find(p => p.id === planId);
    
    const updatedPlans = periodicPlans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          status: 'DA_HOAN_THANH' as const,
          lastMaintained: now.toISOString().split('T')[0],
          checkList: p.checkList.map(item => ({ ...item, passed: true })),
        };
      }
      return p;
    });

    // Automatically create a maintenance history log
    if (targetPlan) {
      const historyRecord: MaintenanceHistoryRecord = {
        id: `MLOG-${now.getFullYear()}-${String(maintenanceHistory.length + 1).padStart(3, '0')}`,
        planId: targetPlan.id,
        equipmentCode: targetPlan.equipmentCode,
        equipmentName: targetPlan.equipmentName,
        location: targetPlan.location,
        maintenanceDate: now.toISOString().split('T')[0],
        technicianId: currentUser.id,
        technicianName: currentUser.name,
        result: 'DAT_TIEU_CHUAN',
        checklistResults: targetPlan.checkList.map(c => ({
          title: c.title,
          standard: c.standard,
          passed: true,
          actualValue: 'Đạt kiểm tra theo quy chuẩn'
        })),
        measuredCurrent: actualValues.current,
        measuredPressure: actualValues.pressure,
        measuredTemp: actualValues.temp,
        photoUrl: photo.url,
        watermark: photo.watermark,
        notes: `Bảo dưỡng định kỳ chu kỳ ${targetPlan.cycle}. Các thông số dòng điện (${actualValues.current}A), áp suất (${actualValues.pressure} Bar), nhiệt độ (${actualValues.temp}°C) đều nằm trong ngưỡng an toàn.`
      };

      const updatedHistory = [historyRecord, ...maintenanceHistory];
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
      setMaintenanceHistory(updatedHistory);

      // Update equipment status if it was marked as due
      const updatedEq = equipments.map(eq => {
        if (eq.code === targetPlan.equipmentCode) {
          return {
            ...eq,
            status: 'HOAT_DONG_TOT' as const,
          };
        }
        return eq;
      });
      localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(updatedEq));
      setEquipments(updatedEq);
    }

    localStorage.setItem(STORAGE_KEYS.PERIODIC, JSON.stringify(updatedPlans));
    setPeriodicPlans(updatedPlans);
    syncChannel?.postMessage({ type: 'SYNC_ALL' });

    pushNotification(
      'BQL',
      `Hoàn thành bảo trì định kỳ: ${targetPlan?.equipmentName || planId}`,
      `KTV ${currentUser.name} đã quét QR, đo thông số và hoàn tất bảo dưỡng thiết bị.`,
      undefined,
      'SUCCESS'
    );
  }, [periodicPlans, equipments, maintenanceHistory, currentUser, pushNotification]);

  // Create new periodic maintenance plan with configured checklist
  const createPeriodicPlan = useCallback((planData: Omit<PeriodicMaintenancePlan, 'id'>) => {
    const newPlan: PeriodicMaintenancePlan = {
      ...planData,
      id: 'pmp_' + Date.now(),
    };
    const updated = [newPlan, ...periodicPlans];
    localStorage.setItem(STORAGE_KEYS.PERIODIC, JSON.stringify(updated));
    setPeriodicPlans(updated);
    syncChannel?.postMessage({ type: 'SYNC_ALL' });

    pushNotification(
      'KTV',
      `Kế hoạch bảo trì mới: ${newPlan.equipmentName}`,
      `BQL đã lập danh sách bảo trì cho thiết bị ${newPlan.equipmentCode} (${newPlan.cycle}). Phụ trách: ${newPlan.assignedKtvName}.`,
      undefined,
      'INFO'
    );

    return newPlan;
  }, [periodicPlans, pushNotification]);

  // Add equipment to catalog
  const addEquipment = useCallback((eqData: Omit<EquipmentItem, 'id'>) => {
    const newEq: EquipmentItem = {
      ...eqData,
      id: 'eq_' + Date.now(),
    };
    const updated = [newEq, ...equipments];
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(updated));
    setEquipments(updated);
    syncChannel?.postMessage({ type: 'SYNC_ALL' });

    pushNotification(
      'BQL',
      `Thiết bị mới: ${newEq.code}`,
      `Đã thêm thiết bị [${newEq.name}] tại ${newEq.location} vào danh mục quản lý.`,
      undefined,
      'SUCCESS'
    );

    return newEq;
  }, [equipments, pushNotification]);

  // Update equipment
  const updateEquipment = useCallback((id: string, updates: Partial<EquipmentItem>) => {
    const updated = equipments.map(eq => eq.id === id ? { ...eq, ...updates } : eq);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(updated));
    setEquipments(updated);
    syncChannel?.postMessage({ type: 'SYNC_ALL' });
  }, [equipments]);

  // Add maintenance history record
  const addMaintenanceHistory = useCallback((recordData: Omit<MaintenanceHistoryRecord, 'id'>) => {
    const newRecord: MaintenanceHistoryRecord = {
      ...recordData,
      id: `MLOG-${new Date().getFullYear()}-${String(maintenanceHistory.length + 1).padStart(3, '0')}`,
    };
    const updated = [newRecord, ...maintenanceHistory];
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    setMaintenanceHistory(updated);
    syncChannel?.postMessage({ type: 'SYNC_ALL' });
    return newRecord;
  }, [maintenanceHistory]);

  // Reset to clean slate (empty tickets)
  const resetToCleanSlate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    setTickets([]);
    setNotifications([]);
    syncChannel?.postMessage({ type: 'SYNC_ALL' });
  }, []);

  // Load sample demo data if requested
  const loadSampleData = useCallback(() => {
    const now = Date.now();
    const sampleTickets: MaintenanceTicket[] = [
      {
        id: '#PA-01',
        code: 'PA-01',
        title: 'Rò rỉ nước đầu van bồn rửa bát',
        residentId: 'usr_cd01',
        residentName: 'Nguyễn Văn An',
        apartmentCode: 'P.1204 - Aqua 1',
        residentPhone: '0912 345 678',
        scope: 'SO_HUU_RIENG',
        category: 'Nuoc',
        location: 'Khu vực bếp căn hộ 1204',
        description: 'Van nước dưới bồn rửa bị xì nước liên tục thấm xuống sàn gỗ, cần KTV đến kiểm tra thay gioăng hoặc van.',
        priority: 'P2',
        status: 'CHO_DUYET',
        createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
        slaDeadline: calculateSlaDeadline('P2', new Date(now - 45 * 60 * 1000)),
        initialMedia: [
          {
            id: 'm1',
            url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
            name: 'hien-truong-1.jpg',
            type: 'image',
          },
          {
            id: 'm2',
            url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
            name: 'hien-truong-2.jpg',
            type: 'image',
          },
          {
            id: 'm3',
            url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80',
            name: 'hien-truong-3.jpg',
            type: 'image',
          },
        ],
        beforePhotos: [],
        materialsUsed: [],
        afterPhotos: [],
        timeline: [
          {
            step: 1,
            title: 'Khởi tạo phản ánh sự cố',
            timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
            actor: 'Nguyễn Văn An',
            actorRole: 'RESIDENT',
            note: 'Đã gửi báo cáo với 3 ảnh hiện trường.',
          },
        ],
        followers: ['Nguyễn Văn An'],
      },
      {
        id: '#PA-02',
        code: 'PA-02',
        title: 'Chập cầu dao tổng phòng khách',
        residentId: 'usr_cd01',
        residentName: 'Nguyễn Văn An',
        apartmentCode: 'P.1204 - Aqua 1',
        residentPhone: '0912 345 678',
        scope: 'SO_HUU_RIENG',
        category: 'Dien',
        location: 'Tủ điện tổng hành lang căn hộ',
        description: 'Bật bình nóng lạnh thì nhảy aptomat có mùi khét, cần xử lý gấp.',
        priority: 'P1',
        status: 'DANG_XU_LY',
        createdAt: new Date(now - 90 * 60 * 1000).toISOString(),
        slaDeadline: calculateSlaDeadline('P1', new Date(now - 90 * 60 * 1000)),
        initialMedia: [
          {
            id: 'm4',
            url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
            name: 'aptomat-chay.jpg',
            type: 'image',
          },
        ],
        assignedTechnicianId: 'usr_ktv01',
        assignedTechnicianName: 'Lê Kỹ Thuật (Hùng)',
        assignedTechnicianPhone: '0987 654 321',
        assignedAt: new Date(now - 60 * 60 * 1000).toISOString(),
        technicianAcceptedAt: new Date(now - 50 * 60 * 1000).toISOString(),
        beforePhotos: [
          {
            id: 'b1',
            url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
            name: 'before_aptomat.jpg',
            type: 'image',
            watermark: 'GPS: 10.7769° N, 106.7009° E | 22/10/2026 14:10',
          },
        ],
        materialsUsed: [],
        afterPhotos: [],
        timeline: [
          {
            step: 1,
            title: 'Khởi tạo phản ánh sự cố',
            timestamp: new Date(now - 90 * 60 * 1000).toISOString(),
            actor: 'Nguyễn Văn An',
            actorRole: 'RESIDENT',
          },
          {
            step: 2,
            title: 'BQL duyệt & Giao việc khẩn cấp (P1)',
            timestamp: new Date(now - 60 * 60 * 1000).toISOString(),
            actor: 'Trần Ban Quản Lý (Tuấn)',
            actorRole: 'BQL',
          },
          {
            step: 3,
            title: 'KTV tiếp nhận & đang tiến hành kiểm tra',
            timestamp: new Date(now - 50 * 60 * 1000).toISOString(),
            actor: 'Lê Kỹ Thuật (Hùng)',
            actorRole: 'KTV',
          },
        ],
      },
    ];

    localStorage.setItem(STORAGE_KEYS.PERIODIC, JSON.stringify(SAMPLE_PERIODIC_PLANS));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(SAMPLE_EQUIPMENTS));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(SAMPLE_MAINTENANCE_HISTORY));
    setPeriodicPlans(SAMPLE_PERIODIC_PLANS);
    setEquipments(SAMPLE_EQUIPMENTS);
    setMaintenanceHistory(SAMPLE_MAINTENANCE_HISTORY);

    persistAndBroadcast(sampleTickets, undefined, SAMPLE_PERIODIC_PLANS, SAMPLE_EQUIPMENTS, SAMPLE_MAINTENANCE_HISTORY);
  }, [persistAndBroadcast]);

  return {
    currentUser,
    tickets,
    notifications,
    periodicPlans,
    equipments,
    maintenanceHistory,
    activeToast,
    dismissToast: () => setActiveToast(null),
    login,
    logout,
    switchRole,
    switchAccount,
    createTicket,
    checkForDuplicates,
    followExistingTicket,
    classifyTicket,
    assignTechnician,
    ktvAcceptTicket,
    ktvSubmitCompletion,
    approveInspection,
    rejectInspection,
    verifyComplaint,
    autoCloseTicketAfter48h,
    completePeriodicMaintenance,
    createPeriodicPlan,
    addEquipment,
    updateEquipment,
    addMaintenanceHistory,
    resetToCleanSlate,
    loadSampleData,
  };
}

