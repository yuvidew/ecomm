import { pool } from "@/config/db";
import { PaymentRow, PaymentMethod, PaymentStatus } from "@/types/payment.types";
import { ResultSetHeader } from "mysql2";

// create a new payment attempt in the "initiated" state
export const createPayment = async (
    orderId: number,
    userId: number,
    amount: string,
    method: PaymentMethod,
    transactionRef: string
): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO payments (order_id, user_id, amount, method, transaction_ref) VALUES (?, ?, ?, ?, ?)",
        [orderId, userId, amount, method, transactionRef]
    );

    return result.insertId;
};

// find a payment by its transaction refrence
export const findPaymentByRef = async (transactionRef : string): Promise<PaymentRow | null> => {
    const [rows] = await pool.query<PaymentRow[]>(
        "SELECT * FROM payments WHERE transaction_ref = ?",
        [transactionRef]
    );

    return rows[0] ?? null;
};

// find a payment by id
export const findPaymentById = async (id: number): Promise<PaymentRow | null> => {
    const [rows] = await pool.query<PaymentRow[]>(
        "SELECT * FROM payments WHERE id = ?",
        [id]
    );

    return rows[0] ?? null;
}

// list every payment attempt for an order, newset fist
export const findPaymentByOrder = async (orderId: number): Promise<PaymentRow[]> => {
    const [rows] = await pool.query<PaymentRow[]>(
        "SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC",
        [orderId]
    );

    return rows;
};

// finalize a payment (success/failed) and, on success, mark the order paid - atomically
export const finalizePayment = async (
    paymentId: number,
    orderId: number,
    status: PaymentStatus,
    failureReason: string | null
): Promise<void> => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            "UPDATE payments SET status = ?, failure_reason = ? WHERE id = ?",
            [status, failureReason, paymentId]
        );

        if (status === "success") {
            await connection.query(
                "UPDATE orders SET status = 'paid' WHERE id = ?",
                [orderId]
            )
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

};

