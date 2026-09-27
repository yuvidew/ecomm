import * as cartRepository from "@/repositories/cart.repository";
import * as productRepository from "@/repositories/product.repository";
import { AddToCartType, UpdateCartItemType } from "@/types/cart.types";

// attach product images to cart item
const attachImages = async (item:Awaited<ReturnType<typeof cartRepository.findCartByUser>>[number]) => {
    const images = await productRepository.findProductsImages(item.product_id);

    return {
        ...item,
        images: images?.map((img) => img.url) ?? []
    };
};


// get the requester's full cart
export const getCart = async (userId : number) => {
    const items = await cartRepository.findCartByUser(userId);
    const withImages = await Promise.all(items.map(attachImages))
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return {items: withImages, total};
};

// add a product to the cartm or increment its auantity if it it's already there
export const addTocart = async (userId: number, input: AddToCartType) => {
    const product = await productRepository.findProductById(input.productId);

    if (!product) {
        throw { status: 404, message: "Product not found" };
    }

    const existing = await cartRepository.findCartItems(userId, input.productId);

    if (existing) {
        await cartRepository.incrementCartItemsQuantity(existing.id, input.quantity);
    } else {
        await cartRepository.createCartItems(userId, input.productId, input.quantity);
    }

    return getCart(userId);
};

// set a cart line's quantity to an exact value
export const updateCartItem = async (userId: number, itemId: number, input: UpdateCartItemType) => {
    const item = await cartRepository.findCartItemById(itemId);

    if (!item || item.user_id !== userId) {
        throw { status: 404, message: "Cart item not found" };
    }

    await cartRepository.setCartItemsQuantity(itemId, input.quantity);
    return getCart(userId);
};

// remove a single line from the cart
export const removeCartItem = async (userId: number, itemId: number) => {
    const item = await cartRepository.findCartItemById(itemId);

    if (!item || item.user_id !== userId) {
        throw { status: 404, message: "Cart item not found" };
    }

    await cartRepository.deleteCartItem(itemId);
    return getCart(userId);
};

// empty the cart
export const clearCart = async (userId: number) => {
    await cartRepository.clearCart(userId);
    return { message: "Cart cleared successfully" };
};