import { NextFunction, Request, Response } from "express";
import * as orderService from "@/services/order.service";


// place an order from the current cart
export const placeOrderController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.placeOrder(req.user!.id, req.body);
        return res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// list the requester's orders
export const getOrdersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await orderService.getOrders(req.user!.id);
        return res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

// list every order (admin)
export const getAllOrdersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await orderService.getAllOrders();
        return res.status(200).json(orders)
    } catch (error) {
        next(error)
    }
};

// get a single order
export const getOrderByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isAdmin = req.user!.role === "admin";
        const order = await orderService.getOrderById(
            req.user!.id,
            Number(req.params.orderId),
            isAdmin
        );

        return res.status(200).json(order)
    } catch (error) {
        next(error);
    }
};

// update an order's stauts (admin)
export const updateOrderStatusController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.updateOrderStatus(
            Number(req.params.orderId),
            req.body
        );

        return res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};

// cancle a pending order
export const cancelOrderController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.cancleOrder(
            req.user!.id,
            Number(req.params.orderId)
        );

        return res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};