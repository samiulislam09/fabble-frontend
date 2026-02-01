'use server';


export interface CheckoutFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface CartItem {
    id: string;
    productId?: number;
    variantId?: number | null;
    quantity: number;
    size: string;
    color: string;
    unitPrice: number;
}

export async function createOrder(formData: CheckoutFormData, items: CartItem[]) {
    console.log('Creating order with items:', items);
    try {
        // Calculate subtotal and total
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const shippingCharge = subtotal > 50 ? 0 : 60;
        const total = subtotal + shippingCharge;

        const payload = {
            customer: {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone,
                email: formData.email
            },
            shippingAddress: {
                line1: formData.address,
                city: formData.city,
                postalCode: formData.zipCode,
                country: "BD"
            },
            items: items.map(item => ({
                productId: item.productId || parseInt(item.id),
                variantId: item.variantId || null,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            })),
            shippingMethod: "standard",
            shippingCharge: shippingCharge,
            paymentMethod: "COD",
            subtotal: subtotal,
            discountAmount: 0,
            taxAmount: 0,
            total: total,
            orderStatus: "pending",
            paymentStatus: "pending"
        };

        // Use the API URL from environment or fallback to localhost for development
        const apiUrl = process.env.NEXT_PUBLIC_APP_API_URL || 'http://localhost:5001/api';

        const response = await fetch(`${apiUrl}/orders/direct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for authentication
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to place order');
        }

        const data = await response.json();
        return {
            success: true,
            data,
            orderId: data.id || Math.random().toString(36).substring(7).toUpperCase()
        };
    } catch (error) {
        console.error('Order placement error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to place order'
        };
    }
}
