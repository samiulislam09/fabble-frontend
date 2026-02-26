'use server';


export interface CheckoutFormData {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    shippingZone: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | string;
}

export interface CartItem {
    id: string;
    productId?: number;
    variantId?: number | null;
    quantity: number;
    size: string;
    color: string;
    variantType?: string;
    variantValue?: string;
    unitPrice: number;
}

export async function createOrder(formData: CheckoutFormData, items: CartItem[], accessToken?: string | null) {
    console.log('Creating order with items:', items);
    try {
        // Use the API URL from environment or fallback to localhost for development
        const apiUrl = process.env.APP_API_URL || 'http://localhost:5001/api';
        const shippingZone = formData.shippingZone === 'OUTSIDE_DHAKA' ? 'OUTSIDE_DHAKA' : 'INSIDE_DHAKA';
        const shippingCity = shippingZone === 'OUTSIDE_DHAKA' ? 'Outside Dhaka' : 'Dhaka';
        const shippingCharge = shippingZone === 'OUTSIDE_DHAKA' ? 110 : 80;
        const shippingMethod = shippingZone;

        if (accessToken) {
            const response = await fetch(`${apiUrl}/orders/place`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    shippingAddress: formData.address,
                    shippingCity: shippingCity,
                    shippingCountry: 'Bangladesh',
                    shippingMethod: shippingMethod,
                    paymentMethod: 'CASH_ON_DELIVERY',
                    customerNotes: '',
                    customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                    customerPhone: formData.phone
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const details = Array.isArray(errorData.errors) ? errorData.errors.join(', ') : '';
                const message = errorData.message || 'Failed to place order';
                throw new Error(details ? `${message}: ${details}` : message);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                orderId: data?.data?.order?.id || data?.order?.id || data?.id
            };
        }

        // Calculate subtotal and total for direct order (guest)
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const total = subtotal + shippingCharge;

        const payload = {
            customer: {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                phone: formData.phone
            },
            shippingAddress: {
                line1: formData.address,
                city: shippingCity,
                country: "BD"
            },
            items: items.map(item => {
                const normalizedVariantType = item.variantType?.toLowerCase() || '';
                const size = normalizedVariantType.includes('size')
                    ? (item.variantValue || item.size)
                    : item.size;
                const color = normalizedVariantType.includes('color')
                    ? (item.variantValue || item.color)
                    : item.color;

                return {
                    productId: item.productId || parseInt(item.id, 10),
                    variantId: item.variantId || null,
                    size: size || null,
                    color: color || null,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                };
            }),
            shippingMethod: shippingMethod,
            shippingCharge: shippingCharge,
            paymentMethod: "COD",
            subtotal: subtotal,
            discountAmount: 0,
            taxAmount: 0,
            total: total,
            orderStatus: "pending",
            paymentStatus: "pending"
        };

        const response = await fetch(`${apiUrl}/orders/direct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const details = Array.isArray(errorData.errors) ? errorData.errors.join(', ') : '';
            const message = errorData.message || 'Failed to place order';
            throw new Error(details ? `${message}: ${details}` : message);
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
