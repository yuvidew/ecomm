import * as orderRepository from "@/repositories/order.repository";
import * as cartRepository from "@/repositories/cart.repository";
import * as productRepository from "@/repositories/product.repository";
import { PlaceOrderType, UpdateOrderStatusType } from "@/types/order.types";


// attach product's images to an order line items
const attachItemsImages = async (item: Awaited<ReturnType<typeof orderRepository.findOrderItems>>[number]) => {
    const images = await productRepository.findProductsImages(item.product_id);
    
    return {
        ...item,
        images : images?.map((img) => img.url) ?? []
    }
}

// attach line items (with images) to an order
const attachItems = async (order: NonNullable<Awaited<ReturnType<typeof orderRepository.findOrderById>>>) => {
    const items = await orderRepository.findOrderItems(order.id);
    const withImages = await Promise.all(items.map(attachItemsImages))
    return { ...order, items : withImages };
};

// get a single order, scoped to its owner unless isAdmin
export const getOrderById = async (userId: number, orderId: number, isAdmin: boolean) => {
    const order = await orderRepository.findOrderById(orderId);

    if (!order || (!isAdmin && order.user_id !== userId)) {
        throw { status: 404, message: "Order not found" };
    }

    return attachItems(order);
};


// place an order from the current cart
export const placeOrder = async (userId: number, input: PlaceOrderType) => {
    const cartItems = await cartRepository.findCartByUser(userId);

    if (!cartItems.length) {
        throw {
            status : 400,
            message : "Cart is empty"
        }
    };

    const orderId = await orderRepository.createOrderFromCart(
        userId,
        cartItems,
        input.shippingAddress
    );

    return getOrderById(userId, orderId, false)
};

// list the requster's orders
export const getOrders = async (userId: number) => {
    const orders = await orderRepository.findOrderByUser(userId);
    return Promise.all(orders.map(attachItems));
};

// list every order (admin)
export const getAllOrders = async () => {
    const orders = await orderRepository.findAllOrders();
    return Promise.all(orders.map(attachItems));
};

// update an order's status (admin)
export const updateOrderStatus = async (orderId : number, input: UpdateOrderStatusType) => {
    const order = await orderRepository.findOrderById(orderId);

    if (!order) {
        throw {
            status: 404,
            message: "Order not found"
        }
    }

    await orderRepository.updateOrderSchema(orderId, input.status);
    return getOrderById(order.user_id, orderId, true);
};


// cancle a pending order (owner only)
export const cancleOrder = async (userId: number, orderId: number) => {
    const order = await orderRepository.findOrderById(orderId);

    if (!order || order.user_id !== userId) {
        throw {
            status : 404,
            message: "Order not found"
        }
    }

    if (order.status !== "pending") {
        throw {
            status: 409,
            message : "Only pending orders can be cancelled"
        }
    }

    await orderRepository.updateOrderSchema(orderId, "cancelled");
    return getOrderById(userId, orderId, false)
}