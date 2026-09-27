import { pool } from "@/config/db";
import * as reviewRepository from "@/repositories/review.repository";
import * as productRepository from "@/repositories/product.repository";
import { RowDataPacket } from "mysql2";

const dummyComments = [
    "Great quality, exactly as described!",
    "Good value for money.",
    "Works well, would buy again.",
    "Decent product but delivery was slow.",
    "Exceeded my expectations!",
    "Not bad, does the job.",
    "Really happy with this purchase.",
    "Average product, nothing special.",
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// add a random dummy rating + comment for a product from a given user
const addDummyReview = async (userId: number, productId: number) => {
    const existing = await reviewRepository.findReviewByUserAndProduct(userId, productId);
    if (existing) return;

    const rating = randomInt(1, 5);
    const comment = dummyComments[randomInt(0, dummyComments.length - 1)];

    await reviewRepository.createReview(userId, productId, rating, comment);
};

const seedReviews = async () => {
    const [products] = await pool.query<RowDataPacket[]>("SELECT id FROM products");
    const [users] = await pool.query<RowDataPacket[]>("SELECT id FROM users");

    if (!users.length) {
        console.log("No users found, skipping review seeding");
        return;
    }

    for (const product of products) {
        const reviewCount = randomInt(1, Math.min(5, users.length));
        const reviewers = [...users].sort(() => Math.random() - 0.5).slice(0, reviewCount);

        for (const user of reviewers) {
            await addDummyReview(user.id, product.id);
        }

        await productRepository.recalculateProductRating(product.id);
        console.log(`Seeded ${reviewCount} review(s) for product ${product.id}`);
    }
};

seedReviews()
    .then(() => {
        console.log("Review seeding complete");
    })
    .catch((error) => {
        console.error("Review seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
