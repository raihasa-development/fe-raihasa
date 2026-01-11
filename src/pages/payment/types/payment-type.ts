export interface ICurrentMembership {
  start: string;
  end: string;
  type: string;
}

export interface ICreatePaymentRequest {
  product_id: string;
  user_id: string;
}

export interface ICreatePaymentResponse {
  user_program_id: string;
  token: string;
  redirect_url: string;
  current_membership: ICurrentMembership | null;
}

export interface IPaymentModalProps {
  isOpen: boolean;
  token: string;
  onSuccess: (result: any) => void;
  onPending: (result: any) => void;
  onError: (result: any) => void;
  onClose: () => void;
}

export interface IProductPaymentProps {
  productId: string;
  productName: string;
  productPrice: number;
  productDescription?: string;
  onPaymentSuccess?: (userProgramId: string) => void;
}

export enum PaymentStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  ERROR = 'ERROR',
}

// Midtrans Snap types
export interface IMidtransSnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
}

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: IMidtransSnapResult) => void;
          onPending?: (result: IMidtransSnapResult) => void;
          onError?: (result: IMidtransSnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}
