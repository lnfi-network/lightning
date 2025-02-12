import {
  AuthenticatedLightningArgs,
  AuthenticatedLightningMethod,
} from "../../typescript";
export type PaymentTaprootInvoiceArgs = AuthenticatedLightningArgs<{
  tpr: any;
  asset_id: string;
  asset_amount: number;
  peer_pubkey: string;
  payment_request: {
    payment_request: string;
    fee_limit_sat: number;
    allow_self_payment: boolean;
    timeout_seconds: number;
    outgoing_chan_id: number;
  };
}>;

export type PaymentTaprootInvoiceResult = any;

export const payTaprootInvoice: AuthenticatedLightningMethod<
  PaymentTaprootInvoiceArgs,
  PaymentTaprootInvoiceResult
>;
