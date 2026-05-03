export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";
export type CouponType = "PERCENTAGE" | "AMOUNT";

export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseName: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  transactionId: string | null;
  sslSessionKey: string | null;
  paymentMethod: string | null;
  emailSent: boolean;
  whatsappAdded: boolean;
  couponCode: string | null;
  discountAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  maxUses: number | null;
  usedCount: number;
  paidUsedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  cancelled: number;
  revenue: number;
}
